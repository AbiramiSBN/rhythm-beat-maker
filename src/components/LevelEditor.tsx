import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Trash2, Play } from "lucide-react";
import { toast } from "sonner";

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "spike" | "platform" | "block" | "double-spike" | "tall-block" | "jump-pad";
}

interface CustomLevel {
  name: string;
  obstacles: Obstacle[];
}

interface LevelEditorProps {
  onBack: () => void;
  onLoadLevel: (level: CustomLevel) => void;
}

export const LevelEditor = ({ onBack, onLoadLevel }: LevelEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelName, setLevelName] = useState("My Level");
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [selectedType, setSelectedType] = useState<Obstacle["type"]>("spike");
  const [savedLevels, setSavedLevels] = useState<CustomLevel[]>([]);
  const groundY = 400;

  useEffect(() => {
    // Load saved levels
    const saved = localStorage.getItem("customLevels");
    if (saved) {
      setSavedLevels(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and draw
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "hsl(240, 30%, 6%)");
    gradient.addColorStop(1, "hsl(280, 40%, 12%)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "hsl(240, 20%, 15%)";
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw ground line
    ctx.strokeStyle = "hsl(180, 100%, 50%)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Draw obstacles
    obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
  }, [obstacles]);

  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    ctx.save();

    switch (obstacle.type) {
      case "spike":
        ctx.fillStyle = "hsl(330, 100%, 60%)";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y);
        ctx.closePath();
        ctx.fill();
        break;

      case "double-spike":
        ctx.fillStyle = "hsl(330, 100%, 60%)";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 15, obstacle.y - obstacle.height);
        ctx.lineTo(obstacle.x + 30, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(obstacle.x + 45, obstacle.y - obstacle.height);
        ctx.lineTo(obstacle.x + 60, obstacle.y);
        ctx.lineTo(obstacle.x + 30, obstacle.y);
        ctx.closePath();
        ctx.fill();
        break;

      case "block":
      case "tall-block":
        ctx.fillStyle = "hsl(0, 100%, 60%)";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        break;

      case "jump-pad":
        ctx.fillStyle = "hsl(120, 100%, 50%)";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        ctx.fillStyle = "hsl(120, 100%, 70%)";
        ctx.beginPath();
        ctx.moveTo(obstacle.x + obstacle.width / 2, obstacle.y - 15);
        ctx.lineTo(obstacle.x + obstacle.width / 2 - 8, obstacle.y - 5);
        ctx.lineTo(obstacle.x + obstacle.width / 2 + 8, obstacle.y - 5);
        ctx.closePath();
        ctx.fill();
        break;

      case "platform":
        ctx.fillStyle = "hsl(280, 100%, 65%)";
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        break;
    }

    ctx.restore();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Snap to grid
    const snappedX = Math.round(x / 50) * 50;
    const snappedY = Math.round(y / 50) * 50;

    let newObstacle: Obstacle;

    switch (selectedType) {
      case "spike":
        newObstacle = { x: snappedX, y: groundY, width: 30, height: 30, type: "spike" };
        break;
      case "double-spike":
        newObstacle = { x: snappedX, y: groundY, width: 60, height: 30, type: "double-spike" };
        break;
      case "block":
        newObstacle = { x: snappedX, y: groundY - 30, width: 30, height: 30, type: "block" };
        break;
      case "tall-block":
        newObstacle = { x: snappedX, y: groundY - 60, width: 30, height: 60, type: "tall-block" };
        break;
      case "jump-pad":
        newObstacle = { x: snappedX, y: groundY - 10, width: 40, height: 10, type: "jump-pad" };
        break;
      case "platform":
      default:
        newObstacle = { x: snappedX, y: snappedY, width: 80, height: 15, type: "platform" };
        break;
    }

    setObstacles([...obstacles, newObstacle]);
  };

  const saveLevel = () => {
    if (!levelName.trim()) {
      toast.error("Please enter a level name!");
      return;
    }

    if (obstacles.length === 0) {
      toast.error("Add some obstacles first!");
      return;
    }

    const newLevel: CustomLevel = {
      name: levelName,
      obstacles: obstacles,
    };

    const updated = [...savedLevels, newLevel];
    setSavedLevels(updated);
    localStorage.setItem("customLevels", JSON.stringify(updated));
    toast.success("Level saved!");
  };

  const deleteLevel = (index: number) => {
    const updated = savedLevels.filter((_, i) => i !== index);
    setSavedLevels(updated);
    localStorage.setItem("customLevels", JSON.stringify(updated));
    toast.success("Level deleted!");
  };

  const obstacleTypes: Array<{ type: Obstacle["type"]; label: string; color: string }> = [
    { type: "spike", label: "Spike", color: "bg-secondary" },
    { type: "double-spike", label: "Double Spike", color: "bg-secondary" },
    { type: "block", label: "Block", color: "bg-destructive" },
    { type: "tall-block", label: "Tall Block", color: "bg-destructive" },
    { type: "jump-pad", label: "Jump Pad", color: "bg-green-500" },
    { type: "platform", label: "Platform", color: "bg-accent" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-4">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline" className="border-primary text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Game
          </Button>
          <h1 className="text-3xl font-bold text-primary">Level Editor</h1>
          <div className="w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 bg-card border-primary">
              <div className="flex items-center gap-4 mb-4">
                <Input
                  value={levelName}
                  onChange={(e) => setLevelName(e.target.value)}
                  placeholder="Level name"
                  className="flex-1"
                />
                <Button onClick={saveLevel} className="bg-primary hover:bg-primary/80">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  onClick={() => setObstacles([])}
                  variant="outline"
                  className="border-destructive text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Select obstacle type:</p>
                <div className="grid grid-cols-3 gap-2">
                  {obstacleTypes.map(({ type, label, color }) => (
                    <Button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      variant={selectedType === type ? "default" : "outline"}
                      className={selectedType === type ? color : ""}
                      size="sm"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                onClick={handleCanvasClick}
                className="border-2 border-primary rounded-lg cursor-crosshair w-full"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Click on the canvas to place obstacles. They snap to grid.
              </p>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 bg-card border-primary">
              <h3 className="text-lg font-bold text-primary mb-4">Saved Levels</h3>
              <div className="space-y-2">
                {savedLevels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No saved levels yet</p>
                ) : (
                  savedLevels.map((level, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-background rounded border border-border"
                    >
                      <div>
                        <p className="font-medium text-foreground">{level.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {level.obstacles.length} obstacles
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => onLoadLevel(level)}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteLevel(index)}
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
