import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Lock } from "lucide-react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

interface AchievementsProps {
  onBack: () => void;
}

export const Achievements = ({ onBack }: AchievementsProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("achievements");
    const stats = JSON.parse(localStorage.getItem("game-stats") || "{}");
    
    const allAchievements: Achievement[] = [
      {
        id: "first-jump",
        name: "First Jump",
        description: "Make your first jump",
        icon: "🦘",
        unlocked: (stats.totalJumps || 0) >= 1,
      },
      {
        id: "jump-master",
        name: "Jump Master",
        description: "Make 100 jumps",
        icon: "🚀",
        unlocked: (stats.totalJumps || 0) >= 100,
        progress: Math.min(stats.totalJumps || 0, 100),
        target: 100,
      },
      {
        id: "first-combo",
        name: "First Combo",
        description: "Get your first combo",
        icon: "🔥",
        unlocked: (stats.maxCombo || 0) >= 5,
      },
      {
        id: "combo-king",
        name: "Combo King",
        description: "Reach a 20x combo",
        icon: "👑",
        unlocked: (stats.maxCombo || 0) >= 20,
        progress: Math.min(stats.maxCombo || 0, 20),
        target: 20,
      },
      {
        id: "ghost-buster",
        name: "Ghost Buster",
        description: "Beat your ghost",
        icon: "👻",
        unlocked: stats.beatGhost || false,
      },
      {
        id: "score-1000",
        name: "High Roller",
        description: "Reach score of 1000",
        icon: "💯",
        unlocked: (stats.highScore || 0) >= 1000,
        progress: Math.min(stats.highScore || 0, 1000),
        target: 1000,
      },
      {
        id: "power-collector",
        name: "Power Collector",
        description: "Collect 50 power-ups",
        icon: "⚡",
        unlocked: (stats.powerUpsCollected || 0) >= 50,
        progress: Math.min(stats.powerUpsCollected || 0, 50),
        target: 50,
      },
      {
        id: "survivor",
        name: "Survivor",
        description: "Survive for 5 minutes",
        icon: "⏱️",
        unlocked: (stats.longestRun || 0) >= 300,
        progress: Math.min(stats.longestRun || 0, 300),
        target: 300,
      },
      {
        id: "practice-perfect",
        name: "Practice Makes Perfect",
        description: "Reach 3 checkpoints in practice mode",
        icon: "🎯",
        unlocked: (stats.checkpointsReached || 0) >= 3,
      },
      {
        id: "theme-master",
        name: "Theme Master",
        description: "Try all 3 themes",
        icon: "🎨",
        unlocked: (stats.themesUsed || 0) >= 3,
      },
      {
        id: "level-creator",
        name: "Level Creator",
        description: "Create a custom level",
        icon: "🏗️",
        unlocked: stats.levelsCreated || false,
      },
      {
        id: "challenge-complete",
        name: "Challenge Accepted",
        description: "Complete a daily challenge",
        icon: "📅",
        unlocked: stats.challengesCompleted || false,
      },
      {
        id: "tournament-winner",
        name: "Tournament Champion",
        description: "Win a tournament",
        icon: "👑",
        unlocked: stats.tournamentWins || false,
      },
    ];

    setAchievements(allAchievements);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            {unlockedCount} of {totalCount} unlocked ({percentage}%)
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`border-primary/20 ${!achievement.unlocked && 'opacity-60'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{achievement.icon}</span>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {achievement.name}
                        {achievement.unlocked ? (
                          <Badge variant="default" className="bg-accent">
                            Unlocked
                          </Badge>
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {achievement.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {achievement.progress !== undefined && achievement.target && !achievement.unlocked && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{achievement.progress} / {achievement.target}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
