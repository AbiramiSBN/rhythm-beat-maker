import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Coins, Check } from "lucide-react";
import { SKINS, isSkinUnlocked, purchaseSkin, getCoins } from "@/lib/skins";
import { toast } from "sonner";

interface SkinsProps {
  onBack: () => void;
  currentSkin: string;
  onSelectSkin: (skinId: string) => void;
}

export const Skins = ({ onBack, currentSkin, onSelectSkin }: SkinsProps) => {
  const [coins, setCoins] = useState(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>([]);

  useEffect(() => {
    setCoins(getCoins());
    const unlocked = SKINS.filter(skin => isSkinUnlocked(skin)).map(skin => skin.id);
    setUnlockedSkins(unlocked);
  }, []);

  const handlePurchase = (skinId: string, cost: number) => {
    if (purchaseSkin(skinId, cost)) {
      setCoins(getCoins());
      setUnlockedSkins([...unlockedSkins, skinId]);
      toast.success("Skin purchased successfully!");
    } else {
      toast.error("Not enough coins!");
    }
  };

  const handleSelect = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      onSelectSkin(skinId);
      localStorage.setItem("selected-skin", skinId);
      toast.success("Skin equipped!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-lg">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-xl font-bold">{coins}</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Character Skins</h1>
          <p className="text-muted-foreground">
            Customize your player with unique skins. Unlock through achievements or purchase with coins!
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isSelected = currentSkin === skin.id;

            return (
              <Card 
                key={skin.id} 
                className={`border-primary/20 ${!isUnlocked && 'opacity-60'} ${isSelected && 'ring-2 ring-primary'}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-5xl">{skin.icon}</span>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {skin.name}
                          {isSelected && (
                            <Badge variant="default" className="bg-accent">
                              <Check className="h-3 w-3 mr-1" />
                              Equipped
                            </Badge>
                          )}
                          {!isUnlocked && (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {skin.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      {isUnlocked ? (
                        <span className="text-green-500">✓ Unlocked</span>
                      ) : (
                        <span>🔒 {skin.unlockCondition}</span>
                      )}
                    </div>
                    
                    {isUnlocked ? (
                      <Button 
                        onClick={() => handleSelect(skin.id)}
                        className="w-full"
                        variant={isSelected ? "outline" : "default"}
                        disabled={isSelected}
                      >
                        {isSelected ? "Currently Equipped" : "Equip Skin"}
                      </Button>
                    ) : skin.unlockType === "purchase" && skin.cost ? (
                      <Button 
                        onClick={() => handlePurchase(skin.id, skin.cost!)}
                        className="w-full"
                        variant="default"
                        disabled={coins < skin.cost}
                      >
                        <Coins className="mr-2 h-4 w-4" />
                        Purchase ({skin.cost} coins)
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" disabled>
                        Complete Achievement
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
