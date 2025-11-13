export interface Skin {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCondition: string;
  unlockType: "achievement" | "purchase" | "default";
  achievementId?: string;
  cost?: number;
  particleColor: string;
  trailEffect: "standard" | "sparkle" | "fire" | "ice" | "electric" | "smoke" | "rainbow" | "cosmic";
  renderPlayer: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, theme: any) => void;
}

export const SKINS: Skin[] = [
  {
    id: "classic",
    name: "Classic Cube",
    description: "The original geometry cube",
    icon: "🟦",
    unlockCondition: "Default",
    unlockType: "default",
    particleColor: "hsl(180, 100%, 50%)",
    trailEffect: "standard",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = theme.player;
      ctx.fillRect(x, y, size, size);
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);
      ctx.restore();
    }
  },
  {
    id: "circle",
    name: "Rolling Sphere",
    description: "A smooth rolling sphere",
    icon: "⚪",
    unlockCondition: "Complete 50 jumps",
    unlockType: "achievement",
    achievementId: "jump-master",
    particleColor: "hsl(200, 100%, 70%)",
    trailEffect: "sparkle",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = theme.player;
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "diamond",
    name: "Diamond Shape",
    description: "A shiny diamond form",
    icon: "💎",
    unlockCondition: "Reach 20x combo",
    unlockType: "achievement",
    achievementId: "combo-king",
    particleColor: "hsl(280, 100%, 70%)",
    trailEffect: "sparkle",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = theme.player;
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size, y + size/2);
      ctx.lineTo(x + size/2, y + size);
      ctx.lineTo(x, y + size/2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "star",
    name: "Star Power",
    description: "A glowing star shape",
    icon: "⭐",
    unlockCondition: "Beat your ghost",
    unlockType: "achievement",
    achievementId: "ghost-buster",
    particleColor: "hsl(60, 100%, 60%)",
    trailEffect: "rainbow",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 25;
      ctx.fillStyle = theme.player;
      ctx.beginPath();
      const cx = x + size/2;
      const cy = y + size/2;
      const spikes = 5;
      const outerRadius = size/2;
      const innerRadius = size/4;
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "triangle",
    name: "Swift Triangle",
    description: "Aerodynamic triangle",
    icon: "🔺",
    unlockCondition: "Purchase for 500 coins",
    unlockType: "purchase",
    cost: 500,
    particleColor: "hsl(0, 100%, 60%)",
    trailEffect: "fire",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = theme.player;
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size, y + size);
      ctx.lineTo(x, y + size);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "hexagon",
    name: "Hexagon Elite",
    description: "Advanced hexagon shape",
    icon: "⬢",
    unlockCondition: "Purchase for 1000 coins",
    unlockType: "purchase",
    cost: 1000,
    particleColor: "hsl(160, 100%, 50%)",
    trailEffect: "electric",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 20;
      ctx.fillStyle = theme.player;
      ctx.beginPath();
      const cx = x + size/2;
      const cy = y + size/2;
      const radius = size/2;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = cx + Math.cos(angle) * radius;
        const py = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "rocket",
    name: "Rocket Ship",
    description: "Blast through obstacles",
    icon: "🚀",
    unlockCondition: "Reach score of 1000",
    unlockType: "achievement",
    achievementId: "score-1000",
    particleColor: "hsl(30, 100%, 50%)",
    trailEffect: "fire",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 25;
      ctx.fillStyle = theme.player;
      // Rocket body
      ctx.beginPath();
      ctx.moveTo(x + size/2, y);
      ctx.lineTo(x + size * 0.7, y + size * 0.7);
      ctx.lineTo(x + size * 0.6, y + size * 0.7);
      ctx.lineTo(x + size * 0.6, y + size);
      ctx.lineTo(x + size * 0.4, y + size);
      ctx.lineTo(x + size * 0.4, y + size * 0.7);
      ctx.lineTo(x + size * 0.3, y + size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  },
  {
    id: "crown",
    name: "Royal Crown",
    description: "For the true champion",
    icon: "👑",
    unlockCondition: "Win a tournament",
    unlockType: "achievement",
    achievementId: "tournament-winner",
    particleColor: "hsl(50, 100%, 60%)",
    trailEffect: "cosmic",
    renderPlayer: (ctx, x, y, size, theme) => {
      ctx.save();
      ctx.shadowColor = theme.playerGlow;
      ctx.shadowBlur = 30;
      ctx.fillStyle = theme.player;
      // Crown base
      ctx.fillRect(x, y + size * 0.6, size, size * 0.4);
      // Crown points
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.6);
      ctx.lineTo(x + size * 0.2, y);
      ctx.lineTo(x + size * 0.4, y + size * 0.4);
      ctx.lineTo(x + size * 0.5, y);
      ctx.lineTo(x + size * 0.6, y + size * 0.4);
      ctx.lineTo(x + size * 0.8, y);
      ctx.lineTo(x + size, y + size * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = theme.player;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }
];

export const isSkinUnlocked = (skin: Skin): boolean => {
  if (skin.unlockType === "default") return true;
  
  if (skin.unlockType === "achievement") {
    const stats = JSON.parse(localStorage.getItem("game-stats") || "{}");
    
    switch (skin.achievementId) {
      case "jump-master": return (stats.totalJumps || 0) >= 100;
      case "combo-king": return (stats.maxCombo || 0) >= 20;
      case "ghost-buster": return stats.beatGhost || false;
      case "score-1000": return (stats.highScore || 0) >= 1000;
      case "tournament-winner": return stats.tournamentWins || false;
      default: return false;
    }
  }
  
  if (skin.unlockType === "purchase") {
    const purchasedSkins = JSON.parse(localStorage.getItem("purchased-skins") || "[]");
    return purchasedSkins.includes(skin.id);
  }
  
  return false;
};

export const purchaseSkin = (skinId: string, cost: number): boolean => {
  const coins = parseInt(localStorage.getItem("game-coins") || "0");
  if (coins >= cost) {
    localStorage.setItem("game-coins", (coins - cost).toString());
    const purchasedSkins = JSON.parse(localStorage.getItem("purchased-skins") || "[]");
    purchasedSkins.push(skinId);
    localStorage.setItem("purchased-skins", JSON.stringify(purchasedSkins));
    return true;
  }
  return false;
};

export const getCoins = (): number => {
  return parseInt(localStorage.getItem("game-coins") || "0");
};

export const addCoins = (amount: number): void => {
  const current = getCoins();
  localStorage.setItem("game-coins", (current + amount).toString());
};
