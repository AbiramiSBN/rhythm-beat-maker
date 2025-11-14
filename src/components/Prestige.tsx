import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Star, Zap, TrendingUp, Coins, Award } from "lucide-react";
import { canPrestige, doPrestige, getHighestScore, getPrestigeLevel, PRESTIGE_LEVELS, getPrestigeBonuses } from "@/lib/prestige";
import { useState } from "react";

interface PrestigeProps {
  onClose: () => void;
}

export function Prestige({ onClose }: PrestigeProps) {
  const [prestigeLevel, setPrestigeLevel] = useState(getPrestigeLevel());
  const highestScore = getHighestScore();
  const canDoPrestige = canPrestige();
  const currentBonuses = getPrestigeBonuses();
  const nextLevel = PRESTIGE_LEVELS[prestigeLevel];

  const handlePrestige = () => {
    if (doPrestige()) {
      setPrestigeLevel(getPrestigeLevel());
      onClose();
      window.location.reload(); // Refresh to apply prestige bonuses
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Prestige System
            </h1>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Current Prestige
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-2">{prestigeLevel}</div>
              <p className="text-sm text-muted-foreground">
                {prestigeLevel === 0 ? "Start your prestige journey!" : `Level ${prestigeLevel} Prestige`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Highest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-2">{highestScore.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">
                {nextLevel ? `${nextLevel.required.toLocaleString()} needed for next prestige` : "Max prestige reached!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {prestigeLevel > 0 && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Active Bonuses
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Coin Multiplier</span>
                <Badge variant="outline" className="bg-primary/10">×{currentBonuses.coinMultiplier}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Score Multiplier</span>
                <Badge variant="outline" className="bg-primary/10">×{currentBonuses.scoreMultiplier}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Starting Coins</span>
                <Badge variant="outline" className="bg-primary/10">{currentBonuses.startingCoins}</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {nextLevel && (
          <Card className="border-2 border-primary/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Next Prestige Level {prestigeLevel + 1}
              </CardTitle>
              <CardDescription>
                Required Score: {nextLevel.required.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Bonuses
                  </h4>
                  <div className="grid gap-2 pl-6">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="text-sm">×{nextLevel.bonuses.coinMultiplier} Coin Multiplier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm">×{nextLevel.bonuses.scoreMultiplier} Score Multiplier</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="text-sm">{nextLevel.bonuses.startingCoins} Starting Coins</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Exclusive Unlocks
                  </h4>
                  <div className="flex flex-wrap gap-2 pl-6">
                    {nextLevel.unlocks.map((unlock) => (
                      <Badge key={unlock} variant="secondary">
                        {unlock.replace(/-/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handlePrestige}
                  disabled={!canDoPrestige}
                  className="w-full"
                  size="lg"
                >
                  {canDoPrestige ? (
                    <>
                      <Crown className="w-4 h-4 mr-2" />
                      Prestige Now!
                    </>
                  ) : (
                    `Reach ${nextLevel.required.toLocaleString()} score to prestige`
                  )}
                </Button>

                {canDoPrestige && (
                  <p className="text-xs text-muted-foreground text-center">
                    ⚠️ This will reset your progress and purchased items, but you'll keep prestige bonuses and exclusive items
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!nextLevel && (
          <Card className="border-primary">
            <CardContent className="pt-6 text-center">
              <Crown className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Maximum Prestige Reached!</h3>
              <p className="text-muted-foreground">
                You've reached the highest prestige level. Enjoy your permanent bonuses!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
