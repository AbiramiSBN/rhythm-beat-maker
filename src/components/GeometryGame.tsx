import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Volume2, VolumeX, Settings, Edit, Shield, Zap, Clock, Film, Trophy } from "lucide-react";
import { LevelEditor } from "@/components/LevelEditor";
import { GameControls } from "@/components/GameControls";
import { Leaderboard } from "@/components/Leaderboard";
import { DailyChallenges } from "@/components/DailyChallenges";
import { ReplayViewer } from "@/components/ReplayViewer";
import { soundManager } from "@/lib/sounds";

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

interface ReplayFrame {
  playerY: number;
  playerVelocity: number;
  distance: number;
  score: number;
  obstacles: any[];
}

interface GhostFrame {
  playerY: number;
  distance: number;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  objective: string;
  date: string;
  obstacles: any[];
  targetScore?: number;
  collectAllPowerUps?: boolean;
  noShield?: boolean;
  completed?: boolean;
  bestScore?: number;
}

interface PowerUp {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "shield" | "slow-motion" | "invincibility";
}

interface Theme {
  name: string;
  player: string;
  playerGlow: string;
  ground: string;
  spike: string;
  block: string;
  platform: string;
  jumpPad: string;
  checkpoint: string;
  bgStart: string;
  bgEnd: string;
  gridColor: string;
}

const THEMES: Record<string, Theme> = {
  neon: {
    name: "Neon",
    player: "hsl(180, 100%, 50%)",
    playerGlow: "hsl(180, 100%, 50%)",
    ground: "hsl(180, 100%, 50%)",
    spike: "hsl(330, 100%, 60%)",
    block: "hsl(0, 100%, 60%)",
    platform: "hsl(280, 100%, 65%)",
    jumpPad: "hsl(120, 100%, 50%)",
    checkpoint: "hsl(200, 100%, 50%)",
    bgStart: "hsl(240, 30%, 6%)",
    bgEnd: "hsl(280, 40%, 12%)",
    gridColor: "hsl(240, 20%, 15%)",
  },
  retro: {
    name: "Retro",
    player: "hsl(60, 100%, 50%)",
    playerGlow: "hsl(60, 100%, 70%)",
    ground: "hsl(120, 50%, 40%)",
    spike: "hsl(0, 80%, 50%)",
    block: "hsl(30, 100%, 50%)",
    platform: "hsl(180, 60%, 50%)",
    jumpPad: "hsl(90, 100%, 50%)",
    checkpoint: "hsl(270, 70%, 60%)",
    bgStart: "hsl(220, 20%, 10%)",
    bgEnd: "hsl(220, 30%, 20%)",
    gridColor: "hsl(220, 10%, 25%)",
  },
  space: {
    name: "Space",
    player: "hsl(200, 100%, 60%)",
    playerGlow: "hsl(200, 100%, 80%)",
    ground: "hsl(260, 60%, 50%)",
    spike: "hsl(320, 100%, 50%)",
    block: "hsl(280, 80%, 60%)",
    platform: "hsl(240, 100%, 60%)",
    jumpPad: "hsl(160, 100%, 50%)",
    checkpoint: "hsl(190, 100%, 60%)",
    bgStart: "hsl(240, 50%, 5%)",
    bgEnd: "hsl(260, 40%, 10%)",
    gridColor: "hsl(250, 30%, 15%)",
  },
};

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
  const [currentTheme, setCurrentTheme] = useState<string>("neon");
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [activePowerUp, setActivePowerUp] = useState<string | null>(null);
  const [powerUpTimer, setPowerUpTimer] = useState(0);
  const [showReplays, setShowReplays] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showGhost, setShowGhost] = useState(true);
  const gameLoopRef = useRef<number>();
  const starsRef = useRef<Array<{ x: number; y: number; size: number; speed: number }>>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const lastObstaclePassedRef = useRef<number>(0);
  const replayFramesRef = useRef<ReplayFrame[]>([]);
  const ghostFramesRef = useRef<GhostFrame[]>([]);
  const bestScoreRef = useRef<number>(0);
  const powerUpsCollectedRef = useRef<number>(0);
  const totalPowerUpsRef = useRef<number>(0);

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
      obstacles = customLevel || currentChallenge ? [...(customLevel?.obstacles || currentChallenge?.obstacles || [])] : [];
      scrollSpeed = 6 * gameSpeed;
      distance = 0;
      lastObstacleX = customLevel || currentChallenge ? Math.max(...obstacles.map(o => o.x), 800) : 800;
      boosting = false;
      boostTimer = 0;
      gravity = gameGravity;
      powerUpsRef.current = [];
      lastObstaclePassedRef.current = 0;
      replayFramesRef.current = [];
      powerUpsCollectedRef.current = 0;
      totalPowerUpsRef.current = 0;
      setScore(0);
      setGameOver(false);
      setCombo(0);
      setMultiplier(1);
      setActivePowerUp(null);
      setPowerUpTimer(0);
      
      // Load ghost data for best run
      if (!currentChallenge && !customLevel) {
        const storedBest = localStorage.getItem('best-ghost');
        if (storedBest) {
          ghostFramesRef.current = JSON.parse(storedBest);
          bestScoreRef.current = parseInt(localStorage.getItem('best-score') || '0');
        }
      }
    };

    const jump = () => {
      if (playerY >= groundY - playerSize) {
        playerVelocity = jumpForce;
        isJumping = true;
        if (isSoundEnabled) soundManager.jump();
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

    const theme = THEMES[currentTheme];

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

    const createPowerUp = (): PowerUp => {
      const types: ("shield" | "slow-motion" | "invincibility")[] = ["shield", "slow-motion", "invincibility"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        x: lastObstacleX + 300 + Math.random() * 200,
        y: groundY - 100 - Math.random() * 100,
        width: 30,
        height: 30,
        type,
      };
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
          boosting ? theme.playerGlow : theme.player
        );
      }

      ctx.save();
      ctx.translate(playerX + playerSize / 2, playerY + playerSize / 2);
      ctx.rotate(distance * 0.05);
      
      // Glow effect
      ctx.shadowColor = boosting ? theme.playerGlow : theme.player;
      ctx.shadowBlur = boosting ? 30 : 20;
      
      // Shield effect
      if (activePowerUp === "shield") {
        ctx.strokeStyle = "hsl(200, 100%, 60%)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, playerSize / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Invincibility effect
      if (activePowerUp === "invincibility") {
        ctx.globalAlpha = 0.7;
      }
      
      // Player cube
      ctx.fillStyle = boosting ? theme.playerGlow : theme.player;
      ctx.fillRect(-playerSize / 2, -playerSize / 2, playerSize, playerSize);
      
      // Border
      ctx.strokeStyle = boosting ? theme.playerGlow : theme.player;
      ctx.lineWidth = 2;
      ctx.strokeRect(-playerSize / 2, -playerSize / 2, playerSize, playerSize);
      
      ctx.restore();
    };

    const drawPowerUp = (powerUp: PowerUp) => {
      ctx.save();
      
      const colors = {
        shield: "hsl(200, 100%, 60%)",
        "slow-motion": "hsl(280, 100%, 60%)",
        invincibility: "hsl(50, 100%, 60%)",
      };
      
      ctx.shadowColor = colors[powerUp.type];
      ctx.shadowBlur = 20;
      ctx.fillStyle = colors[powerUp.type];
      ctx.beginPath();
      ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Icon
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const icons = { shield: "🛡️", "slow-motion": "⏱️", invincibility: "✨" };
      ctx.fillText(icons[powerUp.type], powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
      
      ctx.restore();
    };

    const drawObstacle = (obstacle: Obstacle) => {
      ctx.save();
      
      switch (obstacle.type) {
        case "spike":
          ctx.shadowColor = theme.spike;
          ctx.shadowBlur = 15;
          ctx.fillStyle = theme.spike;
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
          ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
          ctx.lineTo(obstacle.x, obstacle.y);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = theme.spike;
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case "double-spike":
          ctx.shadowColor = theme.spike;
          ctx.shadowBlur = 15;
          ctx.fillStyle = theme.spike;
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
          ctx.strokeStyle = theme.spike;
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
          
        case "block":
          ctx.shadowColor = theme.block;
          ctx.shadowBlur = 15;
          ctx.fillStyle = theme.block;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = theme.block;
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
          
        case "tall-block":
          ctx.shadowColor = theme.block;
          ctx.shadowBlur = 15;
          ctx.fillStyle = theme.block;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = theme.block;
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;
          
        case "jump-pad":
          ctx.shadowColor = theme.jumpPad;
          ctx.shadowBlur = 20;
          ctx.fillStyle = theme.jumpPad;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          // Arrow indicator
          ctx.fillStyle = theme.jumpPad;
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - 15);
          ctx.lineTo(obstacle.x + obstacle.width / 2 - 8, obstacle.y - 5);
          ctx.lineTo(obstacle.x + obstacle.width / 2 + 8, obstacle.y - 5);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = theme.jumpPad;
          ctx.lineWidth = 2;
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          break;

        case "checkpoint":
          ctx.shadowColor = theme.checkpoint;
          ctx.shadowBlur = 20;
          ctx.strokeStyle = theme.checkpoint;
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.setLineDash([]);
          // Flag
          ctx.fillStyle = theme.checkpoint;
          ctx.beginPath();
          ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y);
          ctx.lineTo(obstacle.x + obstacle.width / 2 + 20, obstacle.y + 10);
          ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + 20);
          ctx.closePath();
          ctx.fill();
          break;
          
        case "platform":
        default:
          ctx.shadowColor = theme.platform;
          ctx.shadowBlur = 10;
          ctx.fillStyle = theme.platform;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
          ctx.strokeStyle = theme.platform;
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
            if (isSoundEnabled) soundManager.checkpoint();
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
      gradient.addColorStop(0, theme.bgStart);
      gradient.addColorStop(1, theme.bgEnd);
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
      ctx.strokeStyle = theme.gridColor;
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
      ctx.strokeStyle = theme.ground;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // Update power-up timer
      if (powerUpTimer > 0) {
        setPowerUpTimer(powerUpTimer - 1);
        if (powerUpTimer === 1) {
          setActivePowerUp(null);
          if (activePowerUp === "slow-motion") {
            scrollSpeed = 6 * gameSpeed;
            if (audioRef.current) audioRef.current.playbackRate = gameSpeed;
          }
        }
      }

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

        // Track combo for passing obstacles
        if (obstacle.x + obstacle.width < playerX && obstacle.x + obstacle.width > lastObstaclePassedRef.current) {
          if (obstacle.type !== "checkpoint" && obstacle.type !== "platform") {
            lastObstaclePassedRef.current = obstacle.x + obstacle.width;
            setCombo(prev => {
              const newCombo = prev + 1;
              if (newCombo > 0 && newCombo % 5 === 0 && isSoundEnabled) {
                soundManager.comboMilestone(Math.floor(newCombo / 5));
              }
              return newCombo;
            });
            const newMultiplier = Math.min(Math.floor(combo / 5) + 1, 5);
            setMultiplier(newMultiplier);
          }
        }

        if (checkCollision(obstacle)) {
          // Skip collision if invincible
          if (activePowerUp === "invincibility") return;
          
          // Use shield
          if (activePowerUp === "shield") {
            setActivePowerUp(null);
            setPowerUpTimer(0);
            createParticles(playerX + playerSize / 2, playerY + playerSize / 2, 15, "hsl(200, 100%, 60%)", true);
            return;
          }
          
          // Create explosion
          createParticles(playerX + playerSize / 2, playerY + playerSize / 2, 20, theme.spike, true);
          if (isSoundEnabled) soundManager.collision();
          setCombo(0);
          setMultiplier(1);
          
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

      // Update power-ups
      powerUpsRef.current = powerUpsRef.current.filter((powerUp) => powerUp.x > -100);
      powerUpsRef.current.forEach((powerUp) => {
        powerUp.x -= scrollSpeed;
        drawPowerUp(powerUp);

        // Check collision with power-up
        if (
          playerX < powerUp.x + powerUp.width &&
          playerX + playerSize > powerUp.x &&
          playerY < powerUp.y + powerUp.height &&
          playerY + playerSize > powerUp.y
        ) {
          // Check for no-shield challenge
          if (currentChallenge?.noShield && powerUp.type === "shield") {
            return; // Skip shield in no-shield challenge
          }
          
          setActivePowerUp(powerUp.type);
          setPowerUpTimer(300); // 5 seconds at 60fps
          powerUpsRef.current = powerUpsRef.current.filter(p => p !== powerUp);
          createParticles(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, 10, "hsl(60, 100%, 50%)", true);
          powerUpsCollectedRef.current++;
          if (isSoundEnabled) soundManager.powerUp();
          
          if (powerUp.type === "slow-motion") {
            scrollSpeed = 3 * gameSpeed;
            if (audioRef.current) audioRef.current.playbackRate = gameSpeed * 0.5;
          }
        }
      });

      // Generate new obstacles continuously (only in random mode)
      if (!customLevel && !currentChallenge) {
        const lastObstacle = obstacles[obstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < canvas.width + 200) {
          const newObstacle = createObstacle();
          obstacles.push(newObstacle);
          lastObstacleX = newObstacle.x;
        }
        
        // Spawn power-ups occasionally
        if (Math.random() < 0.01 && powerUpsRef.current.length < 2) {
          const newPowerUp = createPowerUp();
          powerUpsRef.current.push(newPowerUp);
          totalPowerUpsRef.current++;
        }
      }
      
      // Count total power-ups in challenge mode
      if (currentChallenge?.collectAllPowerUps && powerUpsRef.current.length < 5 && Math.random() < 0.02) {
        const newPowerUp = createPowerUp();
        powerUpsRef.current.push(newPowerUp);
        totalPowerUpsRef.current++;
      }

      // Draw ghost player
      if (showGhost && ghostFramesRef.current.length > 0) {
        const frameIndex = Math.floor(distance / 0.6);
        const ghostFrame = ghostFramesRef.current[frameIndex];
        if (ghostFrame) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = theme.player;
          ctx.fillRect(playerX, ghostFrame.playerY, playerSize, playerSize);
          ctx.restore();
        }
      }

      // Draw player
      drawPlayer();
      
      // Record replay frame
      replayFramesRef.current.push({
        playerY,
        playerVelocity,
        distance,
        score: Math.floor(distance * multiplier),
        obstacles: obstacles.map(o => ({ ...o })),
      });

      // Update score with multiplier
      distance += scrollSpeed * 0.1;
      setScore(Math.floor(distance * multiplier));

      // Gradually increase difficulty (only in random mode)
      if (!customLevel && !currentChallenge && distance % 200 < scrollSpeed * 0.1 && scrollSpeed < 10 * gameSpeed) {
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
  }, [gameStarted, gameOver, isMuted, gameSpeed, gameGravity, customLevel, practiceMode, lastCheckpoint, currentChallenge, showGhost, isSoundEnabled, currentTheme]);

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
      // Check challenge completion
      let challengeCompleted = false;
      if (currentChallenge) {
        if (currentChallenge.collectAllPowerUps && powerUpsCollectedRef.current === totalPowerUpsRef.current && totalPowerUpsRef.current > 0) {
          challengeCompleted = true;
        } else if (currentChallenge.targetScore && score >= currentChallenge.targetScore) {
          challengeCompleted = true;
        }
        
        if (challengeCompleted) {
          const today = new Date().toISOString().split('T')[0];
          const storedChallenges = localStorage.getItem(`challenges-${today}`);
          if (storedChallenges) {
            const challenges = JSON.parse(storedChallenges);
            const updated = challenges.map((c: Challenge) => 
              c.id === currentChallenge.id ? { ...c, completed: true, bestScore: Math.max(c.bestScore || 0, score) } : c
            );
            localStorage.setItem(`challenges-${today}`, JSON.stringify(updated));
          }
        }
      }
      
      // Save replay
      const replay = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        score,
        frames: replayFramesRef.current,
        type: score > bestScoreRef.current ? "best" : "failed",
      };
      
      const storedReplays = localStorage.getItem('replays');
      const replays = storedReplays ? JSON.parse(storedReplays) : [];
      replays.unshift(replay);
      localStorage.setItem('replays', JSON.stringify(replays.slice(0, 10)));
      
      // Save ghost if new best score
      if (score > bestScoreRef.current && !currentChallenge && !customLevel) {
        const ghostFrames = replayFramesRef.current.map(frame => ({
          playerY: frame.playerY,
          distance: frame.distance,
        }));
        localStorage.setItem('best-ghost', JSON.stringify(ghostFrames));
        localStorage.setItem('best-score', score.toString());
      }
      
      // Save score to leaderboard
      const playerName = prompt(challengeCompleted ? "Challenge completed! Enter your name:" : "Enter your name for the leaderboard:");
      if (playerName) {
        const entry: LeaderboardEntry = {
          name: playerName,
          score,
          date: new Date().toISOString(),
          levelName: customLevel?.name || currentChallenge?.name,
        };
        
        const key = customLevel ? `leaderboard-${customLevel.name}` : currentChallenge ? `leaderboard-${currentChallenge.id}` : 'leaderboard-random';
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

  const handleStartChallenge = (challenge: Challenge) => {
    setCurrentChallenge(challenge);
    setShowChallenges(false);
  };

  // Register service worker for offline support
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('Service Worker registration failed:', err));
    }
  }, []);

  if (showEditor) {
    return <LevelEditor onBack={() => setShowEditor(false)} onLoadLevel={handleLoadLevel} />;
  }

  if (showLeaderboard) {
    return <Leaderboard onBack={() => setShowLeaderboard(false)} />;
  }

  if (showChallenges) {
    return <DailyChallenges onBack={() => setShowChallenges(false)} onStartChallenge={handleStartChallenge} />;
  }

  if (showReplays) {
    return <ReplayViewer onBack={() => setShowReplays(false)} />;
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
          {multiplier > 1 && <span className="text-accent ml-2">x{multiplier}</span>}
          {practiceMode && <span className="text-sm text-muted-foreground ml-2">(Practice)</span>}
        </div>
        {combo > 0 && (
          <div className="text-lg font-bold text-accent animate-pulse">
            Combo: {combo}
          </div>
        )}
        {activePowerUp && (
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 rounded-full">
            {activePowerUp === "shield" && <Shield className="h-4 w-4" />}
            {activePowerUp === "slow-motion" && <Clock className="h-4 w-4" />}
            {activePowerUp === "invincibility" && <Zap className="h-4 w-4" />}
            <span className="text-sm font-bold capitalize">{activePowerUp}</span>
            <span className="text-xs">({Math.ceil(powerUpTimer / 60)}s)</span>
          </div>
        )}
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
        <Button
          onClick={() => setShowChallenges(true)}
          variant="outline"
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Trophy className="h-4 w-4 mr-2" />
          Daily Challenges
        </Button>
        <Button
          onClick={() => setShowReplays(true)}
          variant="outline"
        >
          <Film className="h-4 w-4 mr-2" />
          Replays
        </Button>
        <Button
          onClick={() => setShowGhost(!showGhost)}
          variant="outline"
          className={showGhost ? "border-primary text-primary" : ""}
        >
          Ghost: {showGhost ? "ON" : "OFF"}
        </Button>
        <Button
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          variant="outline"
          className={isSoundEnabled ? "border-primary text-primary" : ""}
        >
          SFX: {isSoundEnabled ? "ON" : "OFF"}
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Theme:</span>
          {Object.keys(THEMES).map((themeKey) => (
            <Button
              key={themeKey}
              onClick={() => setCurrentTheme(themeKey)}
              variant={currentTheme === themeKey ? "default" : "outline"}
              size="sm"
            >
              {THEMES[themeKey].name}
            </Button>
          ))}
        </div>
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
        Controls: SPACE or CLICK to jump 
        {customLevel && ` | Playing: ${customLevel.name}`}
        {currentChallenge && ` | Challenge: ${currentChallenge.name}`}
        {practiceMode && lastCheckpoint > 0 && ` | Last Checkpoint: ${Math.floor(lastCheckpoint)}`}
        {showGhost && bestScoreRef.current > 0 && ` | Ghost Best: ${bestScoreRef.current}`}
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
      
      {currentChallenge && (
        <Button
          onClick={() => setCurrentChallenge(null)}
          variant="outline"
          size="sm"
          className="mt-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          Exit Challenge
        </Button>
      )}
    </div>
  );
};
