import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  levelName?: string;
}

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard = ({ onBack }: LeaderboardProps) => {
  const getLeaderboard = (key: string): LeaderboardEntry[] => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  };

  const customLevels = Object.keys(localStorage).filter(
    (k) => k.startsWith("leaderboard-") && k !== "leaderboard-random"
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-4">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-primary">Leaderboards</h2>
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-primary/20">
            <h3 className="text-2xl font-bold mb-4 text-foreground">Random Mode</h3>
            {(() => {
              const leaderboard = getLeaderboard("leaderboard-random");
              return leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-background/30 rounded"
                    >
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span className="flex-1 mx-4 text-foreground">{entry.name}</span>
                      <span className="text-accent font-bold">{entry.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No scores yet!</p>
              );
            })()}
          </div>

          {customLevels.map((key) => {
            const levelName = key.replace("leaderboard-", "");
            const leaderboard = getLeaderboard(key);

            return (
              <div
                key={key}
                className="bg-background/50 backdrop-blur-sm rounded-lg p-6 border border-secondary/20"
              >
                <h3 className="text-2xl font-bold mb-4 text-foreground">{levelName}</h3>
                {leaderboard.length > 0 ? (
                  <div className="space-y-2">
                    {leaderboard.map((entry, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3 bg-background/30 rounded"
                      >
                        <span className="text-secondary font-bold">{i + 1}.</span>
                        <span className="flex-1 mx-4 text-foreground">{entry.name}</span>
                        <span className="text-accent font-bold">{entry.score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No scores yet!</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
