export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "powerup" | "ability" | "upgrade";
  cost: number;
  effect: string;
  purchased: boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  // Power-up Upgrades
  {
    id: "shield-duration",
    name: "Extended Shield",
    description: "Shield power-up lasts 50% longer",
    icon: "🛡️",
    category: "powerup",
    cost: 500,
    effect: "shield-duration",
    purchased: false,
  },
  {
    id: "slow-motion-boost",
    name: "Enhanced Slow-Motion",
    description: "Slow-motion is even slower and lasts longer",
    icon: "⏱️",
    category: "powerup",
    cost: 600,
    effect: "slowmo-boost",
    purchased: false,
  },
  {
    id: "invincibility-boost",
    name: "Super Invincibility",
    description: "Invincibility lasts twice as long",
    icon: "✨",
    category: "powerup",
    cost: 700,
    effect: "invincibility-boost",
    purchased: false,
  },
  {
    id: "magnet",
    name: "Power-Up Magnet",
    description: "Automatically collect nearby power-ups",
    icon: "🧲",
    category: "powerup",
    cost: 800,
    effect: "magnet",
    purchased: false,
  },
  
  // Special Abilities
  {
    id: "double-jump",
    name: "Double Jump",
    description: "Jump again while in mid-air",
    icon: "🦘",
    category: "ability",
    cost: 1000,
    effect: "double-jump",
    purchased: false,
  },
  {
    id: "dash",
    name: "Air Dash",
    description: "Dash forward in mid-air (Press D)",
    icon: "💨",
    category: "ability",
    cost: 1200,
    effect: "dash",
    purchased: false,
  },
  {
    id: "wall-jump",
    name: "Wall Jump",
    description: "Jump off obstacles for extra height",
    icon: "🧱",
    category: "ability",
    cost: 1500,
    effect: "wall-jump",
    purchased: false,
  },
  {
    id: "glide",
    name: "Glide",
    description: "Hold Space to glide and fall slower",
    icon: "🪂",
    category: "ability",
    cost: 1800,
    effect: "glide",
    purchased: false,
  },
  
  // Score Upgrades
  {
    id: "score-boost",
    name: "Score Multiplier",
    description: "Earn 25% more points",
    icon: "💯",
    category: "upgrade",
    cost: 1000,
    effect: "score-boost",
    purchased: false,
  },
  {
    id: "coin-boost",
    name: "Coin Magnet",
    description: "Earn 50% more coins after each run",
    icon: "💰",
    category: "upgrade",
    cost: 800,
    effect: "coin-boost",
    purchased: false,
  },
  {
    id: "combo-keeper",
    name: "Combo Shield",
    description: "Combo doesn't reset on first collision",
    icon: "🔥",
    category: "upgrade",
    cost: 1500,
    effect: "combo-keeper",
    purchased: false,
  },
  
  // Weapon Upgrades
  {
    id: "basic-weapon",
    name: "Basic Blaster",
    description: "Shoot projectiles to destroy obstacles (Press F)",
    icon: "🔫",
    category: "ability",
    cost: 2000,
    effect: "basic-weapon",
    purchased: false,
  },
  {
    id: "rapid-fire",
    name: "Rapid Fire",
    description: "Shoot faster with reduced cooldown",
    icon: "⚡",
    category: "upgrade",
    cost: 1500,
    effect: "rapid-fire",
    purchased: false,
  },
  {
    id: "piercing-shots",
    name: "Piercing Shots",
    description: "Projectiles pierce through multiple obstacles",
    icon: "💥",
    category: "upgrade",
    cost: 2000,
    effect: "piercing-shots",
    purchased: false,
  },
  {
    id: "explosive-rounds",
    name: "Explosive Rounds",
    description: "Shots create explosions that destroy nearby obstacles",
    icon: "💣",
    category: "upgrade",
    cost: 2500,
    effect: "explosive-rounds",
    purchased: false,
  },
];

export const getPurchasedItems = (): string[] => {
  return JSON.parse(localStorage.getItem("purchased-items") || "[]");
};

export const isPurchased = (itemId: string): boolean => {
  const purchased = getPurchasedItems();
  return purchased.includes(itemId);
};

export const purchaseItem = (itemId: string, cost: number): boolean => {
  const coins = parseInt(localStorage.getItem("game-coins") || "0");
  if (coins >= cost) {
    localStorage.setItem("game-coins", (coins - cost).toString());
    const purchased = getPurchasedItems();
    purchased.push(itemId);
    localStorage.setItem("purchased-items", JSON.stringify(purchased));
    return true;
  }
  return false;
};

export const hasAbility = (abilityId: string): boolean => {
  return isPurchased(abilityId);
};

export const getActiveUpgrades = () => {
  const purchased = getPurchasedItems();
  
  return {
    shieldDuration: purchased.includes("shield-duration") ? 1.5 : 1,
    slowmoBost: purchased.includes("slow-motion-boost") ? 1.5 : 1,
    invincibilityBoost: purchased.includes("invincibility-boost") ? 2 : 1,
    magnetRange: purchased.includes("magnet") ? 150 : 0,
    scoreBoost: purchased.includes("score-boost") ? 1.25 : 1,
    coinBoost: purchased.includes("coin-boost") ? 1.5 : 1,
    comboKeeper: purchased.includes("combo-keeper"),
    doubleJump: purchased.includes("double-jump"),
    dash: purchased.includes("dash"),
    wallJump: purchased.includes("wall-jump"),
    glide: purchased.includes("glide"),
    rapidFire: purchased.includes("rapid-fire"),
    piercingShots: purchased.includes("piercing-shots"),
    explosiveRounds: purchased.includes("explosive-rounds"),
  };
};
