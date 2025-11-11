import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Volume2, VolumeX, Settings, Edit } from "lucide-react";
import { LevelEditor } from "@/components/LevelEditor";
import { GameControls } from "@/components/GameControls";

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "spike" | "platform" | "block" | "double-spike" | "tall-block" | "jump-pad" | "checkpoint";
}

interface CustomLevel {
  name: string;
  obstacles: Obstacle[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  levelName?: string;
}

export const GeometryGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [gameGravity, setGameGravity] = useState(0.8);
  const [customLevel, setCustomLevel] = useState<CustomLevel | null>(null);
  const [practiceMode, setPracticeMode] = useState(false);
  const [lastCheckpoint, setLastCheckpoint] = useState<number>(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const gameLoopRef = useRef<number>();
  const starsRef = useRef<Array<{ x: number; y: number; size: number; speed: number }>>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Initialize parallax stars
  useEffect(() => {
    if (starsRef.current.length === 0) {
      const stars = [];
      for (let i = 0; i < 100; i++) {
        stars.push({
          x: Math.random() * 800,
          y: Math.random() * 500,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
        });
      }
      starsRef.current = stars;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Game state
    let playerY = 300;
    let playerVelocity = 0;
    const playerSize = 30;
    const playerX = 100;
    let gravity = gameGravity;
    const jumpForce = -14;
    let isJumping = false;
    let obstacles: Obstacle[] = customLevel ? [...customLevel.obstacles] : [];
    let scrollSpeed = 6 * gameSpeed;
    let distance = 0;
    let lastObstacleX = customLevel ? Math.max(...obstacles.map(o => o.x), 800) : 800;
    let boosting = false;
    let boostTimer = 0;

    // Ground level
    const groundY = 400;

    const resetGame = () => {
      playerY = 300;
      playerVelocity = 0;
      isJumping = false;
      obstacles = customLevel ? [...customLevel.obstacles] : [];
      scrollSpeed = 6 * gameSpeed;
      distance = 0;
      lastObstacleX = customLevel ? Math.max(...obstacles.map(o => o.x), 800) : 800;
      boosting = false;
      boostTimer = 0;
      gravity = gameGravity;
      setScore(0);
      setGameOver(false);
    };

    const jump = () => {
      if (playerY >= groundY - playerSize) {
        playerVelocity = jumpForce;
        isJumping = true;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameStarted && !gameOver) {
        e.preventDefault();
        jump();
      }
    };

    const handleClick = () => {
      if (gameStarted && !gameOver) {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("click", handleClick);

    const createParticles = (x: number, y: number, count: number, color: string, explosion = false) => {
      for (let i = 0; i < count; i++) {
        const angle = explosion ? (Math.PI * 2 * i) / count : Math.random() * Math.PI * 2;
        const speed = explosion ? 3 + Math.random() * 3 : 1 + Math.random() * 2;
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: explosion ? 30 : 20,
          color,
          size: explosion ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
        });
      }
    };

    const createObstacle = (): Obstacle => {
      const types: ("spike" | "platform" | "block" | "double-spike" | "tall-block" | "jump-pad" | "checkpoint")[] = 
        ["spike", "platform", "block", "double-spike", "tall-block", "jump-pad"];
      
      // Add checkpoint every 1000 units in practice mode
      if (practiceMode && Math.random() < 0.1) {
        types.push("checkpoint", "checkpoint");
      }
      
      const type = types[Math.floor(Math.random() * types.length)];
      
      const spacing = 250 + Math.random() * 150;
      
      switch (type) {
        case "spike":
          return {
            x: lastObstacleX + spacing,
            y: groundY,
            width: 30,
            height: 30,
            type: "spike",
          };
        case "double-spike":
          return {
            x: lastObstacleX + spacing,
            y: groundY,
            width: 60,
            height: 30,
            type: "double-spike",
          };
        case "block":
          return {
            x: lastObstacleX + spacing,
            y: groundY - 30,
            width: 30,
            height: 30,
            type: "block",
          };
        case "tall-block":
          return {
            x: lastObstacleX + spacing,
            y: groundY - 60,
            width: 30,
            height: 60,
            type: "tall-block",
          };
        case "jump-pad":
          return {
            x: lastObstacleX + spacing,
            y: groundY - 10,
            width: 40,
            height: 10,
            type: "jump-pad",
          };
        case "checkpoint":
          return {
            x: lastObstacleX + spacing,
            y: groundY - 80,
            width: 50,
            height: 80,
            type: "checkpoint",
          };
        case "platform":
        default:
          return {
            x: lastObstacleX + spacing,
            y: groundY - 80 - Math.random() * 40,
            width: 80,
            height: 15,
            type: "platform",
          };
      }
    };

    const drawPlayer = () => {
      // Create trail particles
      if (gameStarted && !gameOver) {
        createParticles(
          playerX + playerSize / 2,
          playerY + playerSize / 2,
          2,
          boosting ? "hsl(60, 100%, 50%)" : "hsl(180, 100%, 50%)"
        );
      }

      ctx.save();
      ctx.translate(playerX + playerSize / 2, playerY + playerSize / 2);
      ctx.rotate(distance * 0.05);
      
      // Glow effect (enhanced when boosting)
      ctx.shadowColor = boosting ? "hsl(60, 100%, 50%)" : "hsl(180, 100%, 50%)";
      ctx.shadowBlur = boosting ? 30 : 20;
      
      // Player cube
      ctx.fillStyle = boosting ? "hsl(60, 100%, 50%)" : "hsl(180, 100%, 50%)";
      ctx.fillRect(-playerSize / 2, -playerSize / 2, playerSize, playerSize);
      
      // Border
      ctx.strokeStyle = boosting ? "hsl(60, 100%, 70%)" : "hsl(180, 100%, 70%)";
      ctx.lineWidth = 2;
      ctx.strokeRect(-playerSize / 2, -playerSize / 2, playerSize, playerSize);
      
      ctx.restore();
    };

    const drawObstacle = (obstacle: Obstacle) => {
      ctx.save();
      
      switch (obstacle.type) {
        case "spike":
          ctx.shadowColor = "hsl(330, 100%, 60%)";
          ctx.shadowBlur = 15;
          ctx.fillStyle = "hsl(330, 100%, 60%)";
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
          ctx.lineTo(obstacle.x, obstacle.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "hsl(330, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case "double-spike":
          ctx.shadowColor = "hsl(330, 100%, 60%)";
          ctx.shadowBlur = 15;
          ctx.fillStyle = "hsl(330, 100%, 60%)";
          ctx.beginPath();
          ctx.moveTo(obstacle.x + 15, obstacle.y - obstacle.height);
          ctx.lineTo(obstacle.x + 30, obstacle.y);
          ctx.lineTo(obstacle.x, obstacle.y);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(obstacle.x + 45, obstacle.y - obstacle.height);
          ctx.lineTo(obstacle.x + 60, obstacle.y);
          ctx.lineTo(obstacle.x + 30, obstacle.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "hsl(330, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case "block":
          ctx.shadowColor = "hsl(0, 100%, 60%)";
          ctx.shadowBlur = 15;
          ctx.fillStyle = "hsl(0, 100%, 60%)";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = "hsl(0, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
          
        case "tall-block":
          ctx.shadowColor = "hsl(0, 100%, 60%)";
          ctx.shadowBlur = 15;
          ctx.fillStyle = "hsl(0, 100%, 60%)";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = "hsl(0, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
          
        case "jump-pad":
          ctx.shadowColor = "hsl(120, 100%, 50%)";
          ctx.shadowBlur = 20;
          ctx.fillStyle = "hsl(120, 100%, 50%)";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          // Arrow indicator
          ctx.fillStyle = "hsl(120, 100%, 70%)";
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - 15);
          ctx.lineTo(obstacle.x + obstacle.width / 2 - 8, obstacle.y - 5);
          ctx.lineTo(obstacle.x + obstacle.width / 2 + 8, obstacle.y - 5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = "hsl(120, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;

        case "checkpoint":
          ctx.shadowColor = "hsl(200, 100%, 50%)";
          ctx.shadowBlur = 20;
          ctx.strokeStyle = "hsl(200, 100%, 50%)";
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.setLineDash([]);
          // Flag
          ctx.fillStyle = "hsl(200, 100%, 60%)";
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width / 2 + 20, obstacle.y + 10);
          ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + 20);
          ctx.closePath();
          ctx.fill();
          break;
          
        case "platform":
        default:
          ctx.shadowColor = "hsl(280, 100%, 65%)";
          ctx.shadowBlur = 10;
          ctx.fillStyle = "hsl(280, 100%, 65%)";
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = "hsl(280, 100%, 80%)";
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
      }
      
      ctx.restore();
    };

    const checkCollision = (obstacle: Obstacle): boolean => {
      const margin = 3;
      
      if (obstacle.type === "checkpoint") {
        // Check if player passes through checkpoint
        if (
          playerX + margin < obstacle.x + obstacle.width - margin &&
          playerX + playerSize - margin > obstacle.x + margin &&
          playerY + margin < obstacle.y + obstacle.height - margin &&
          playerY + playerSize - margin > obstacle.y + margin
        ) {
          if (practiceMode && distance > lastCheckpoint) {
            setLastCheckpoint(distance);
          }
        }
        return false;
      } else if (obstacle.type === "spike" || obstacle.type === "double-spike") {
        return (
          playerX + margin < obstacle.x + obstacle.width - margin &&
          playerX + playerSize - margin > obstacle.x + margin &&
          playerY + playerSize - margin > obstacle.y - obstacle.height + margin
        );
      } else if (obstacle.type === "jump-pad") {
        // Check if player is landing on jump pad
        if (
          playerX + margin < obstacle.x + obstacle.width - margin &&
          playerX + playerSize - margin > obstacle.x + margin &&
          playerY + playerSize >= obstacle.y &&
          playerY + playerSize <= obstacle.y + obstacle.height + 5 &&
          playerVelocity >= 0
        ) {
          playerVelocity = -18; // Boost jump
          boosting = true;
          boostTimer = 10;
        }
        return false;
      } else {
        return (
          playerX + margin < obstacle.x + obstacle.width - margin &&
          playerX + playerSize - margin > obstacle.x + margin &&
          playerY + margin < obstacle.y + obstacle.height - margin &&
          playerY + playerSize - margin > obstacle.y + margin
        );
      }
    };

    const gameLoop = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "hsl(240, 30%, 6%)");
      gradient.addColorStop(1, "hsl(280, 40%, 12%)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw parallax stars (slow layer)
      starsRef.current.forEach((star) => {
        star.x -= scrollSpeed * star.speed * 0.1;
        if (star.x < 0) star.x = canvas.width;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 3})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Grid effect (medium layer)
      ctx.strokeStyle = "hsl(240, 20%, 15%)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        const offset = (distance * 0.5) % 50;
        ctx.beginPath();
        ctx.moveTo(i - offset, 0);
        ctx.lineTo(i - offset, canvas.height);
        ctx.stroke();
      }

      // Draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2; // Gravity
        particle.life--;
        
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        return particle.life > 0;
      });

      // Draw ground line (fast layer)
      ctx.strokeStyle = "hsl(180, 100%, 50%)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Update physics
      if (boostTimer > 0) {
        boostTimer--;
        if (boostTimer === 0) boosting = false;
      }
      
      playerVelocity += gravity;
      playerY += playerVelocity;

      // Ground collision
      if (playerY > groundY - playerSize) {
        playerY = groundY - playerSize;
        playerVelocity = 0;
        isJumping = false;
      }

      // Update obstacles
      obstacles = obstacles.filter((obstacle) => obstacle.x > -100);
      obstacles.forEach((obstacle) => {
        obstacle.x -= scrollSpeed;
        drawObstacle(obstacle);

        if (checkCollision(obstacle)) {
          // Create explosion
          createParticles(playerX + playerSize / 2, playerY + playerSize / 2, 20, "hsl(0, 100%, 50%)", true);
          
          if (practiceMode) {
            // Respawn at checkpoint
            distance = lastCheckpoint;
            playerY = 300;
            playerVelocity = 0;
            obstacles = obstacles.filter(o => o.x < distance + 800);
          } else {
            setGameOver(true);
            setGameStarted(false);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        }
      });

      // Generate new obstacles continuously (only in random mode)
      if (!customLevel) {
        const lastObstacle = obstacles[obstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < canvas.width + 200) {
          const newObstacle = createObstacle();
          obstacles.push(newObstacle);
          lastObstacleX = newObstacle.x;
        }
      }

      // Draw player
      drawPlayer();

      // Update score
      distance += scrollSpeed * 0.1;
      setScore(Math.floor(distance));

      // Gradually increase difficulty (only in random mode)
      if (!customLevel && distance % 200 < scrollSpeed * 0.1 && scrollSpeed < 10 * gameSpeed) {
        scrollSpeed += 0.15 * gameSpeed;
      }

      if (gameStarted && !gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    if (gameStarted && !gameOver) {
      resetGame();
      gameLoop();
      if (audioRef.current) {
        audioRef.current.playbackRate = gameSpeed;
        if (!isMuted) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(console.error);
        }
      }
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("click", handleClick);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isMuted, gameSpeed, gameGravity, customLevel, practiceMode, lastCheckpoint]);

  // Cache audio file
  useEffect(() => {
    if (audioRef.current) {
      fetch('/game-music.mp3')
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            localStorage.setItem('cachedGameMusic', reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch(console.error);
    }
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setLastCheckpoint(0);
    
    if (gameOver && !practiceMode) {
      // Save score to leaderboard
      const playerName = prompt("Enter your name for the leaderboard:");
      if (playerName) {
        const entry: LeaderboardEntry = {
          name: playerName,
          score,
          date: new Date().toISOString(),
          levelName: customLevel?.name,
        };
        
        const key = customLevel ? `leaderboard-${customLevel.name}` : 'leaderboard-random';
        const stored = localStorage.getItem(key);
        const leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
        leaderboard.push(entry);
        leaderboard.sort((a, b) => b.score - a.score);
        localStorage.setItem(key, JSON.stringify(leaderboard.slice(0, 10)));
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const handleLoadLevel = (level: CustomLevel) => {
    setCustomLevel(level);
    setShowEditor(false);
  };

  if (showEditor) {
    return <LevelEditor onBack={() => setShowEditor(false)} onLoadLevel={handleLoadLevel} />;
  }

  if (showLeaderboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-4">
        <div className="max-w-2xl w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-4xl font-bold text-primary">Leaderboards</h2>
            <Button onClick={() => setShowLeaderboard(false)} variant="outline">Back</Button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Random Mode</h3>
              {(() => {
                const stored = localStorage.getItem('leaderboard-random');
                const leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
                return leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-background/30 rounded">
                        <span className="text-primary font-bold">{i + 1}.</span>
                        <span className="flex-1 mx-4 text-foreground">{entry.name}</span>
                        <span className="text-accent font-bold">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No scores yet!</p>
                );
              })()}
            </div>

            {(() => {
              const customLevels = Object.keys(localStorage).filter(k => k.startsWith('leaderboard-') && k !== 'leaderboard-random');
              return customLevels.map(key => {
                const levelName = key.replace('leaderboard-', '');
                const stored = localStorage.getItem(key);
                const leaderboard: LeaderboardEntry[] = stored ? JSON.parse(stored) : [];
                
                return (
                  <div key={key} className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-secondary/20">
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{levelName}</h3>
                    {leaderboard.length > 0 ? (
                      <div className="space-y-2">
                        {leaderboard.map((entry, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-background/30 rounded">
                            <span className="text-secondary font-bold">{i + 1}.</span>
                            <span className="flex-1 mx-4 text-foreground">{entry.name}</span>
                            <span className="text-accent font-bold">{entry.score}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No scores yet!</p>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-4">
      <audio ref={audioRef} src="/game-music.mp3" loop />
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="border-2 border-primary rounded-lg shadow-2xl shadow-primary/20"
        />
        
        {!gameStarted && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <h1 className="text-5xl font-bold mb-4 text-primary drop-shadow-[0_0_20px_hsl(var(--primary))]">
              GEOMETRY DASH
            </h1>
            <p className="text-xl mb-8 text-foreground">
              {gameOver ? `Game Over! Score: ${score}` : "Press SPACE or CLICK to jump"}
            </p>
            <Button
              onClick={startGame}
              size="lg"
              className="bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/50 hover:shadow-primary/70 transition-all"
            >
              {gameOver ? (
                <>
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Try Again
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start Game
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <div className="text-2xl font-bold text-primary">
          Score: <span className="text-foreground">{score}</span>
          {practiceMode && <span className="text-sm text-accent ml-2">(Practice Mode)</span>}
        </div>
        <Button
          onClick={toggleMute}
          variant="outline"
          size="icon"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
        <Button
          onClick={() => setShowControls(!showControls)}
          variant="outline"
          size="icon"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setShowEditor(true)}
          variant="outline"
          size="icon"
          className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <Edit className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setPracticeMode(!practiceMode)}
          variant="outline"
          className={practiceMode ? "border-accent text-accent" : ""}
        >
          Practice Mode
        </Button>
        <Button
          onClick={() => setShowLeaderboard(true)}
          variant="outline"
        >
          Leaderboards
        </Button>
      </div>

      {showControls && (
        <GameControls
          gameSpeed={gameSpeed}
          gameGravity={gameGravity}
          onSpeedChange={setGameSpeed}
          onGravityChange={setGameGravity}
        />
      )}

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Controls: SPACE or CLICK to jump {customLevel && `| Playing: ${customLevel.name}`}
        {practiceMode && lastCheckpoint > 0 && ` | Last Checkpoint: ${Math.floor(lastCheckpoint)}`}
      </div>
      
      {customLevel && (
        <Button
          onClick={() => setCustomLevel(null)}
          variant="outline"
          size="sm"
          className="mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Back to Random Mode
        </Button>
      )}
    </div>
  );
};
