import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Coins, Check, ShoppingBag, Zap, TrendingUp } from "lucide-react";
import { SHOP_ITEMS, purchaseItem, isPurchased, getActiveUpgrades } from "@/lib/shop";
import { getCoins } from "@/lib/skins";
import { toast } from "sonner";

interface ShopProps {
  onBack: () => void;
}

export const Shop = ({ onBack }: ShopProps) => {
  const [coins, setCoins] = useState(0);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("powerup");

  useEffect(() => {
    setCoins(getCoins());
    const purchased = JSON.parse(localStorage.getItem("purchased-items") || "[]");
    setPurchasedItems(purchased);
  }, []);

  const handlePurchase = (itemId: string, cost: number) => {
    if (purchaseItem(itemId, cost)) {
      setCoins(getCoins());
      setPurchasedItems([...purchasedItems, itemId]);
      toast.success("Item purchased successfully!");
    } else {
      toast.error("Not enough coins!");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "powerup": return <Zap className="h-5 w-5" />;
      case "ability": return <ShoppingBag className="h-5 w-5" />;
      case "upgrade": return <TrendingUp className="h-5 w-5" />;
      default: return null;
    }
  };

  const renderItems = (category: string) => {
    const items = SHOP_ITEMS.filter(item => item.category === category);
    
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const purchased = purchasedItems.includes(item.id);

          return (
            <Card 
              key={item.id} 
              className={`border-primary/20 ${purchased && 'opacity-75'}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{item.icon}</span>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {item.name}
                        {purchased && (
                          <Badge variant="default" className="bg-accent">
                            <Check className="h-3 w-3 mr-1" />
                            Owned
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">{item.effect}</span>
                  </div>
                  
                  {purchased ? (
                    <Button className="w-full" variant="outline" disabled>
                      Already Purchased
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handlePurchase(item.id, item.cost)}
                      className="w-full"
                      variant="default"
                      disabled={coins < item.cost}
                    >
                      <Coins className="mr-2 h-4 w-4" />
                      Purchase ({item.cost} coins)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2 bg-accent/20 px-6 py-3 rounded-lg">
            <Coins className="h-6 w-6 text-yellow-400" />
            <span className="text-2xl font-bold">{coins}</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 flex items-center gap-2">
            <ShoppingBag className="h-10 w-10" />
            Item Shop
          </h1>
          <p className="text-muted-foreground">
            Upgrade your abilities and power-ups with coins earned from playing!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="powerup" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Power-Ups
            </TabsTrigger>
            <TabsTrigger value="ability" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Abilities
            </TabsTrigger>
            <TabsTrigger value="upgrade" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Upgrades
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="powerup">
            {renderItems("powerup")}
          </TabsContent>
          
          <TabsContent value="ability">
            {renderItems("ability")}
          </TabsContent>
          
          <TabsContent value="upgrade">
            {renderItems("upgrade")}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
