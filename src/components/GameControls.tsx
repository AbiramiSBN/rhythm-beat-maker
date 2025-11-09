import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface GameControlsProps {
  gameSpeed: number;
  gameGravity: number;
  onSpeedChange: (value: number) => void;
  onGravityChange: (value: number) => void;
}

export const GameControls = ({
  gameSpeed,
  gameGravity,
  onSpeedChange,
  onGravityChange,
}: GameControlsProps) => {
  return (
    <Card className="mt-4 p-6 w-full max-w-md bg-card border-primary">
      <h3 className="text-lg font-bold text-primary mb-4">Game Settings</h3>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="speed" className="text-foreground">
              Game Speed
            </Label>
            <span className="text-sm text-muted-foreground">{gameSpeed.toFixed(1)}x</span>
          </div>
          <Slider
            id="speed"
            min={0.5}
            max={3}
            step={0.1}
            value={[gameSpeed]}
            onValueChange={([value]) => onSpeedChange(value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Affects scroll speed and music tempo
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="gravity" className="text-foreground">
              Gravity
            </Label>
            <span className="text-sm text-muted-foreground">{gameGravity.toFixed(1)}</span>
          </div>
          <Slider
            id="gravity"
            min={0.3}
            max={1.5}
            step={0.1}
            value={[gameGravity]}
            onValueChange={([value]) => onGravityChange(value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Higher values = faster falling
          </p>
        </div>
      </div>
    </Card>
  );
};
