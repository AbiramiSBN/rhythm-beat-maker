export const updateGameStats = (updates: Record<string, any>) => {
  const stats = JSON.parse(localStorage.getItem("game-stats") || "{}");
  const newStats = { ...stats };
  
  Object.keys(updates).forEach((key) => {
    if (key === "totalJumps" || key === "powerUpsCollected" || key === "checkpointsReached") {
      newStats[key] = (newStats[key] || 0) + updates[key];
    } else if (key === "maxCombo" || key === "highScore" || key === "longestRun") {
      newStats[key] = Math.max(newStats[key] || 0, updates[key]);
    } else {
      newStats[key] = updates[key];
    }
  });
  
  localStorage.setItem("game-stats", JSON.stringify(newStats));
  
  // Check for new achievements
  checkAchievements(newStats);
};

const checkAchievements = (stats: Record<string, any>) => {
  const achievements = [];
  
  if (stats.totalJumps >= 1) achievements.push("first-jump");
  if (stats.totalJumps >= 100) achievements.push("jump-master");
  if (stats.maxCombo >= 5) achievements.push("first-combo");
  if (stats.maxCombo >= 20) achievements.push("combo-king");
  if (stats.beatGhost) achievements.push("ghost-buster");
  if (stats.highScore >= 1000) achievements.push("score-1000");
  if (stats.powerUpsCollected >= 50) achievements.push("power-collector");
  if (stats.longestRun >= 300) achievements.push("survivor");
  if (stats.checkpointsReached >= 3) achievements.push("practice-perfect");
  if (stats.themesUsed >= 3) achievements.push("theme-master");
  if (stats.levelsCreated) achievements.push("level-creator");
  if (stats.challengesCompleted) achievements.push("challenge-complete");
  if (stats.tournamentWins) achievements.push("tournament-winner");
  
  return achievements;
};
