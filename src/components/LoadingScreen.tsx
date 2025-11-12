import { useEffect, useState } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete(), 300);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-game-bg-start to-game-bg-end">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-primary animate-pulse drop-shadow-[0_0_30px_hsl(var(--primary))]">
          GEOMETRY DASH
        </h1>
        
        <div className="w-64 mx-auto space-y-2">
          <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300 shadow-[0_0_20px_hsl(var(--primary))]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-primary font-semibold">{progress}%</p>
        </div>

        <div className="text-muted-foreground animate-pulse">
          Loading game assets...
        </div>
      </div>
    </div>
  );
};
