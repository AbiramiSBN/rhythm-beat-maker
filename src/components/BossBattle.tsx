export interface Boss {
  id: string;
  name: string;
  scoreThreshold: number;
  health: number;
  maxHealth: number;
  attacks: BossAttack[];
  phase: number;
  defeated: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  attackCooldown: number;
  rewards: {
    coins: number;
    items: string[];
  };
}

export interface BossAttack {
  type: "projectile" | "ground-slam" | "laser" | "spawn-obstacles";
  cooldown: number;
  damage: number;
}

export const BOSSES: Omit<Boss, "x" | "y" | "attackCooldown">[] = [
  {
    id: "cube-tyrant",
    name: "The Cube Tyrant",
    scoreThreshold: 5000,
    health: 100,
    maxHealth: 100,
    phase: 1,
    defeated: false,
    width: 80,
    height: 80,
    color: "hsl(0, 100%, 50%)",
    attacks: [
      { type: "projectile", cooldown: 60, damage: 10 },
      { type: "ground-slam", cooldown: 120, damage: 20 },
    ],
    rewards: {
      coins: 500,
      items: ["boss-1-badge", "boss-1-skin"],
    },
  },
  {
    id: "spike-lord",
    name: "The Spike Lord",
    scoreThreshold: 10000,
    health: 150,
    maxHealth: 150,
    phase: 1,
    defeated: false,
    width: 100,
    height: 100,
    color: "hsl(280, 100%, 50%)",
    attacks: [
      { type: "projectile", cooldown: 45, damage: 15 },
      { type: "spawn-obstacles", cooldown: 90, damage: 0 },
      { type: "laser", cooldown: 150, damage: 30 },
    ],
    rewards: {
      coins: 1000,
      items: ["boss-2-badge", "boss-2-skin"],
    },
  },
  {
    id: "geometry-master",
    name: "Geometry Master",
    scoreThreshold: 20000,
    health: 250,
    maxHealth: 250,
    phase: 1,
    defeated: false,
    width: 120,
    height: 120,
    color: "hsl(180, 100%, 50%)",
    attacks: [
      { type: "projectile", cooldown: 30, damage: 20 },
      { type: "laser", cooldown: 90, damage: 40 },
      { type: "ground-slam", cooldown: 120, damage: 30 },
      { type: "spawn-obstacles", cooldown: 60, damage: 0 },
    ],
    rewards: {
      coins: 2500,
      items: ["boss-3-badge", "boss-3-skin", "ultimate-weapon"],
    },
  },
];

export const getBossForScore = (score: number): Boss | null => {
  const defeatedBosses = getDefeatedBosses();
  
  for (const bossTemplate of BOSSES) {
    if (score >= bossTemplate.scoreThreshold && !defeatedBosses.includes(bossTemplate.id)) {
      return {
        ...bossTemplate,
        x: 1000,
        y: 400,
        attackCooldown: 0,
      };
    }
  }
  
  return null;
};

export const getDefeatedBosses = (): string[] => {
  return JSON.parse(localStorage.getItem("defeated-bosses") || "[]");
};

export const markBossDefeated = (bossId: string) => {
  const defeated = getDefeatedBosses();
  if (!defeated.includes(bossId)) {
    defeated.push(bossId);
    localStorage.setItem("defeated-bosses", JSON.stringify(defeated));
  }
};

export const resetBosses = () => {
  localStorage.removeItem("defeated-bosses");
};
