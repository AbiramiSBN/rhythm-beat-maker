import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Target } from "lucide-react";

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

interface DailyChallengesProps {
  onBack: () => void;
  onStartChallenge: (challenge: Challenge) => void;
}

const generateDailyChallenge = (date: string): Challenge => {
  const seed = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const rand = () => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const challenges = [
    {
      id: `${date}-1`,
      name: "Power Collector",
      description: "Collect all power-ups",
      objective: "collectAllPowerUps",
      collectAllPowerUps: true,
    },
    {
      id: `${date}-2`,
      name: "No Shield Challenge",
      description: "Reach score 500 without using shield",
      objective: "noShield",
      targetScore: 500,
      noShield: true,
    },
    {
      id: `${date}-3`,
      name: "Speed Runner",
      description: "Complete the preset course in record time",
      objective: "targetScore",
      targetScore: 1000,
    },
  ];

  const selectedChallenge = challenges[Math.floor(rand() * challenges.length)];
  
  // Generate preset obstacles
  const obstacles = [];
  for (let i = 0; i < 10; i++) {
    const x = 800 + i * 300;
    const types = ["spike", "block", "platform", "jump-pad"];
    const type = types[Math.floor(rand() * types.length)];
    
    obstacles.push({
      x,
      y: type === "platform" ? 320 : 400,
      width: type === "platform" ? 80 : 30,
      height: type === "platform" ? 15 : 30,
      type,
    });
  }

  return {
    ...selectedChallenge,
    date,
    obstacles,
  };
};

export const DailyChallenges = ({ onBack, onStartChallenge }: DailyChallengesProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedChallenges = localStorage.getItem(`challenges-${today}`);
    
    if (storedChallenges) {
      setChallenges(JSON.parse(storedChallenges));
    } else {
      const newChallenges = [1, 2, 3].map(() => generateDailyChallenge(today));
      setChallenges(newChallenges);
      localStorage.setItem(`challenges-${today}`, JSON.stringify(newChallenges));
    }
  }, []);

  const handleStartChallenge = (challenge: Challenge) => {
    onStartChallenge(challenge);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Daily Challenges</h1>
          <p className="text-muted-foreground">Complete today's challenges for rewards!</p>
        </div>

        <div className="grid gap-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id} className="border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      {challenge.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {challenge.description}
                    </CardDescription>
                  </div>
                  {challenge.completed && (
                    <Badge variant="default" className="bg-accent">
                      <Trophy className="h-3 w-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {challenge.bestScore && `Best Score: ${challenge.bestScore}`}
                  </div>
                  <Button
                    onClick={() => handleStartChallenge(challenge)}
                    className="bg-primary hover:bg-primary/80"
                  >
                    Start Challenge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
