export interface PrestigeLevel {
  level: number;
  required: number;
  bonuses: {
    coinMultiplier: number;
    scoreMultiplier: number;
    startingCoins: number;
  };
  unlocks: string[];
}

export const PRESTIGE_LEVELS: PrestigeLevel[] = [
  {
    level: 1,
    required: 10000,
    bonuses: {
      coinMultiplier: 1.2,
      scoreMultiplier: 1.1,
      startingCoins: 500,
    },
    unlocks: ["prestige-skin-1", "prestige-trail-1"],
  },
  {
    level: 2,
    required: 25000,
    bonuses: {
      coinMultiplier: 1.5,
      scoreMultiplier: 1.25,
      startingCoins: 1000,
    },
    unlocks: ["prestige-skin-2", "prestige-trail-2", "prestige-weapon-1"],
  },
  {
    level: 3,
    required: 50000,
    bonuses: {
      coinMultiplier: 2.0,
      scoreMultiplier: 1.5,
      startingCoins: 2000,
    },
    unlocks: ["prestige-skin-3", "prestige-trail-3", "prestige-weapon-2"],
  },
  {
    level: 4,
    required: 100000,
    bonuses: {
      coinMultiplier: 3.0,
      scoreMultiplier: 2.0,
      startingCoins: 5000,
    },
    unlocks: ["prestige-skin-ultimate", "prestige-trail-ultimate", "prestige-weapon-ultimate"],
  },
];

export const getPrestigeLevel = (): number => {
  return parseInt(localStorage.getItem("prestige-level") || "0");
};

export const getHighestScore = (): number => {
  return parseInt(localStorage.getItem("highest-score") || "0");
};

export const canPrestige = (): boolean => {
  const currentLevel = getPrestigeLevel();
  const highestScore = getHighestScore();
  const nextLevel = PRESTIGE_LEVELS[currentLevel];
  return nextLevel ? highestScore >= nextLevel.required : false;
};

export const doPrestige = (): boolean => {
  if (!canPrestige()) return false;
  
  const currentLevel = getPrestigeLevel();
  const newLevel = currentLevel + 1;
  const prestigeData = PRESTIGE_LEVELS[currentLevel];
  
  // Reset progress
  localStorage.setItem("game-coins", prestigeData.bonuses.startingCoins.toString());
  localStorage.setItem("highest-score", "0");
  localStorage.removeItem("purchased-items");
  
  // Keep prestige items and skins
  const prestigeItems = JSON.parse(localStorage.getItem("prestige-items") || "[]");
  prestigeItems.push(...prestigeData.unlocks);
  localStorage.setItem("prestige-items", JSON.stringify(prestigeItems));
  
  // Set new prestige level
  localStorage.setItem("prestige-level", newLevel.toString());
  
  return true;
};

export const getPrestigeBonuses = () => {
  const level = getPrestigeLevel();
  if (level === 0) {
    return {
      coinMultiplier: 1,
      scoreMultiplier: 1,
      startingCoins: 0,
    };
  }
  
  return PRESTIGE_LEVELS[level - 1].bonuses;
};

export const getPrestigeItems = (): string[] => {
  return JSON.parse(localStorage.getItem("prestige-items") || "[]");
};

export const hasPrestigeItem = (itemId: string): boolean => {
  return getPrestigeItems().includes(itemId);
};
