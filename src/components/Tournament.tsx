import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Users, Swords, Crown } from "lucide-react";
import { toast } from "sonner";

interface TournamentPlayer {
  id: string;
  name: string;
  score: number;
  eliminated: boolean;
}

interface TournamentMatch {
  player1: TournamentPlayer;
  player2: TournamentPlayer;
  winner?: TournamentPlayer;
  round: number;
}

interface TournamentProps {
  onBack: () => void;
  onStartMatch: (match: TournamentMatch) => void;
  currentScore: number;
}

export const Tournament = ({ onBack, onStartMatch, currentScore }: TournamentProps) => {
  const [tournamentState, setTournamentState] = useState<"setup" | "bracket" | "match" | "ceremony">("setup");
  const [currentRound, setCurrentRound] = useState(1);
  const [players, setPlayers] = useState<TournamentPlayer[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<TournamentMatch | null>(null);
  const [winner, setWinner] = useState<TournamentPlayer | null>(null);

  // Check for returning from match
  useEffect(() => {
    const matchScore = localStorage.getItem('tournament-match-score');
    const savedMatch = localStorage.getItem('current-tournament-match');
    if (matchScore && savedMatch) {
      const match = JSON.parse(savedMatch);
      setCurrentMatch(match);
      completeMatch(match, parseInt(matchScore));
      localStorage.removeItem('tournament-match-score');
      localStorage.removeItem('current-tournament-match');
    }
  }, []);

  const generatePlayers = (count: number): TournamentPlayer[] => {
    const playerNames = ["Shadow", "Phoenix", "Thunder", "Storm", "Blaze", "Frost", "Viper", "Titan"];
    return Array.from({ length: count }, (_, i) => ({
      id: `player-${i}`,
      name: i === 0 ? "You" : playerNames[i % playerNames.length],
      score: 0,
      eliminated: false,
    }));
  };

  const startTournament = (playerCount: number) => {
    const newPlayers = generatePlayers(playerCount);
    setPlayers(newPlayers);
    setCurrentRound(1);
    generateRound(newPlayers, 1);
    setTournamentState("bracket");
    toast.success(`Tournament started with ${playerCount} players!`);
  };

  const generateRound = (activePlayers: TournamentPlayer[], round: number) => {
    const newMatches: TournamentMatch[] = [];
    for (let i = 0; i < activePlayers.length; i += 2) {
      if (i + 1 < activePlayers.length) {
        newMatches.push({
          player1: activePlayers[i],
          player2: activePlayers[i + 1],
          round,
        });
      }
    }
    setMatches(newMatches);
  };

  const startMatch = (match: TournamentMatch) => {
    setCurrentMatch(match);
    localStorage.setItem('current-tournament-match', JSON.stringify(match));
    setTournamentState("match");
    onStartMatch(match);
  };

  const completeMatch = (match: TournamentMatch, userScore: number) => {
    // AI opponent score (slightly randomized)
    const aiScore = Math.floor(Math.random() * 800) + 200;
    const player1Score = match.player1.name === "You" ? userScore : aiScore;
    const player2Score = match.player2.name === "You" ? userScore : Math.floor(Math.random() * 800) + 200;
    
    const matchWinner = player1Score > player2Score ? match.player1 : match.player2;
    const loser = player1Score > player2Score ? match.player2 : match.player1;
    
    matchWinner.score = Math.max(player1Score, player2Score);
    loser.eliminated = true;
    
    const updatedMatches = matches.map(m => 
      m === match ? { ...m, winner: matchWinner } : m
    );
    setMatches(updatedMatches);
    
    // Check if round is complete
    const allMatchesComplete = updatedMatches.every(m => m.winner);
    if (allMatchesComplete) {
      const winners = updatedMatches.map(m => m.winner!).filter(p => !p.eliminated);
      
      if (winners.length === 1) {
        // Tournament over
        setWinner(winners[0]);
        setTournamentState("ceremony");
        
        // Save tournament win for achievements
        if (winners[0].name === "You") {
          const stats = JSON.parse(localStorage.getItem("game-stats") || "{}");
          stats.tournamentWins = true;
          localStorage.setItem("game-stats", JSON.stringify(stats));
          
          // Award coins
          const coins = parseInt(localStorage.getItem("game-coins") || "0");
          localStorage.setItem("game-coins", (coins + 1000).toString());
          toast.success("🏆 Tournament Champion! +1000 coins!");
        }
      } else {
        // Next round
        setCurrentRound(currentRound + 1);
        generateRound(winners, currentRound + 1);
        setTournamentState("bracket");
        toast.success(`Round ${currentRound} complete! Moving to Round ${currentRound + 1}`);
      }
    } else {
      setTournamentState("bracket");
      toast.success(`Match complete! ${matchWinner.name} wins!`);
    }
  };

  if (tournamentState === "setup") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
              <Trophy className="h-12 w-12" />
              Tournament Mode
            </h1>
            <p className="text-xl text-muted-foreground">
              Compete in elimination brackets to become the champion!
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-primary/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => startTournament(4)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6" />
                  4 Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Quick tournament with 2 rounds</p>
                <Badge variant="outline">Semifinals → Final</Badge>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => startTournament(8)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="h-6 w-6" />
                  8 Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Full tournament with 3 rounds</p>
                <Badge variant="outline">Quarterfinals → Semifinals → Final</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (tournamentState === "ceremony" && winner) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-8 animate-bounce">
            <Crown className="h-32 w-32 mx-auto text-yellow-400" />
          </div>
          <h1 className="text-6xl font-bold text-primary mb-4">
            🎉 CHAMPION! 🎉
          </h1>
          <p className="text-3xl text-foreground mb-8">
            {winner.name === "You" ? "You are" : `${winner.name} is`} the tournament winner!
          </p>
          <div className="text-2xl text-muted-foreground mb-12">
            Final Score: {winner.score}
          </div>
          {winner.name === "You" && (
            <div className="mb-8 text-xl text-accent">
              🪙 +1000 Coins Earned!
            </div>
          )}
          <Button onClick={onBack} size="lg" className="text-xl px-8 py-6">
            Return to Menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-game-bg-start to-game-bg-end p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Tournament
          </Button>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Round {currentRound}
          </Badge>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Tournament Bracket</h1>
          <p className="text-muted-foreground">Click on a match to begin</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match, index) => (
            <Card 
              key={`match-${index}`} 
              className={`border-primary/20 ${match.winner ? 'opacity-60' : 'hover:border-primary/50 cursor-pointer'}`}
              onClick={() => !match.winner && startMatch(match)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Match {index + 1}
                  </span>
                  {match.winner && (
                    <Badge variant="default" className="bg-accent">
                      Complete
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center justify-between p-3 rounded ${match.winner === match.player1 ? 'bg-accent/20 ring-2 ring-accent' : 'bg-muted/50'}`}>
                    <span className="font-semibold">{match.player1.name}</span>
                    {match.winner && <span className="text-sm">{match.player1.score}</span>}
                  </div>
                  <div className="text-center text-muted-foreground">VS</div>
                  <div className={`flex items-center justify-between p-3 rounded ${match.winner === match.player2 ? 'bg-accent/20 ring-2 ring-accent' : 'bg-muted/50'}`}>
                    <span className="font-semibold">{match.player2.name}</span>
                    {match.winner && <span className="text-sm">{match.player2.score}</span>}
                  </div>
                </div>
                {!match.winner && (
                  <Button className="w-full mt-4">
                    Start Match
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
