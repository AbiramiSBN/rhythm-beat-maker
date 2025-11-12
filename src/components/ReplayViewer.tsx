import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, Trash2 } from "lucide-react";

interface ReplayFrame {
  playerY: number;
  playerVelocity: number;
  distance: number;
  score: number;
  obstacles: any[];
}

interface Replay {
  id: string;
  date: string;
  score: number;
  frames: ReplayFrame[];
  type: "best" | "failed";
}

interface ReplayViewerProps {
  onBack: () => void;
}

export const ReplayViewer = ({ onBack }: ReplayViewerProps) => {
  const [replays, setReplays] = useState<Replay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<Replay | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("replays");
    if (stored) {
      setReplays(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!selectedReplay || !isPlaying || !canvasRef.current) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= selectedReplay.frames.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 1;
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [selectedReplay, isPlaying]);

  useEffect(() => {
    if (!selectedReplay || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frame = selectedReplay.frames[currentFrame];
    if (!frame) return;

    // Clear canvas
    ctx.fillStyle = "hsl(240, 30%, 6%)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.strokeStyle = "hsl(180, 100%, 50%)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 400);
    ctx.lineTo(canvas.width, 400);
    ctx.stroke();

    // Draw obstacles
    frame.obstacles.forEach((obstacle) => {
      ctx.fillStyle = "hsl(330, 100%, 60%)";
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw player
    const playerX = 100;
    const playerSize = 30;
    ctx.fillStyle = "hsl(180, 100%, 50%)";
    ctx.shadowColor = "hsl(180, 100%, 50%)";
    ctx.shadowBlur = 20;
    ctx.fillRect(playerX, frame.playerY, playerSize, playerSize);

    // Draw score
    ctx.shadowBlur = 0;
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${frame.score}`, 10, 30);
    ctx.fillText(`Frame: ${currentFrame} / ${selectedReplay.frames.length}`, 10, 60);
  }, [selectedReplay, currentFrame]);

  const handleDelete = (replayId: string) => {
    const newReplays = replays.filter((r) => r.id !== replayId);
    setReplays(newReplays);
    localStorage.setItem("replays", JSON.stringify(newReplays));
    if (selectedReplay?.id === replayId) {
      setSelectedReplay(null);
    }
  };

  if (selectedReplay) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => setSelectedReplay(null)} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Replays
          </Button>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Replay - Score: {selectedReplay.score}</CardTitle>
              <CardDescription>
                {new Date(selectedReplay.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <canvas
                ref={canvasRef}
                width={800}
                height={500}
                className="border-2 border-primary rounded-lg w-full"
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-primary hover:bg-primary/80"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => setCurrentFrame(0)}
                  variant="outline"
                >
                  Restart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Replay System</h1>
          <p className="text-muted-foreground">Watch your best runs and learn from failures</p>
        </div>

        {replays.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">
              No replays recorded yet. Play some games to see them here!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {replays.map((replay) => (
              <Card key={replay.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>
                        {replay.type === "best" ? "Best Run" : "Failed Run"} - Score: {replay.score}
                      </CardTitle>
                      <CardDescription>
                        {new Date(replay.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {replay.frames.length} frames
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedReplay(replay)}
                        className="bg-primary hover:bg-primary/80"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Watch
                      </Button>
                      <Button
                        onClick={() => handleDelete(replay.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
