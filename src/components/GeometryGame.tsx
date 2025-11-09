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
  type: "spike" | "platform" | "block" | "double-spike" | "tall-block" | "jump-pad";
}

interface CustomLevel {
  name: string;
  obstacles: Obstacle[];
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
  const gameLoopRef = useRef<number>();
  const starsRef = useRef<Array<{ x: number; y: number; size: number; speed: number }>>([]);

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

    const createObstacle = (): Obstacle => {
      const types: ("spike" | "platform" | "block" | "double-spike" | "tall-block" | "jump-pad")[] = 
        ["spike", "platform", "block", "double-spike", "tall-block", "jump-pad"];
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
      
      if (obstacle.type === "spike" || obstacle.type === "double-spike") {
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
          setGameOver(true);
          setGameStarted(false);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
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
  }, [gameStarted, gameOver, isMuted, gameSpeed, gameGravity, customLevel]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
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

      <div className="mt-6 flex items-center gap-4">
        <div className="text-2xl font-bold text-primary">
          Score: <span className="text-foreground">{score}</span>
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
      </div>

      {showControls && (
        <GameControls
          gameSpeed={gameSpeed}
          gameGravity={gameGravity}
          onSpeedChange={setGameSpeed}
          onGravityChange={setGameGravity}
        />
      )}

      <div className="mt-4 text-sm text-muted-foreground">
        Controls: SPACE or CLICK to jump {customLevel && `| Playing: ${customLevel.name}`}
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
