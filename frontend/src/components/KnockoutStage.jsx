import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Trophy } from "lucide-react";

const KnockoutStage = ({ knockoutMatches, setKnockoutMatches, onFinish }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  const handleMatchClick = (roundIndex, matchIndex, match) => {
    if (match.player1 && match.player2 && !match.winner) {
      setSelectedMatch({ roundIndex, matchIndex, match });
      setScore1("");
      setScore2("");
    }
  };

  const handleSaveScore = () => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0 || s1 === s2) return;

    const { roundIndex, matchIndex, match } = selectedMatch;
    const newMatches = JSON.parse(JSON.stringify(knockoutMatches));
    
    const winner = s1 > s2 ? match.player1 : match.player2;
    newMatches[roundIndex][matchIndex].score1 = s1;
    newMatches[roundIndex][matchIndex].score2 = s2;
    newMatches[roundIndex][matchIndex].winner = winner;

    // Advance winner to next round
    if (roundIndex < newMatches.length - 1) {
      const nextRoundMatchIndex = Math.floor(matchIndex / 2);
      if (matchIndex % 2 === 0) {
        newMatches[roundIndex + 1][nextRoundMatchIndex].player1 = winner;
      } else {
        newMatches[roundIndex + 1][nextRoundMatchIndex].player2 = winner;
      }
    } else {
      // This was the final
      onFinish(winner);
    }

    setKnockoutMatches(newMatches);
    setSelectedMatch(null);
  };

  const getRoundName = (roundIndex, totalRounds) => {
    const roundsFromEnd = totalRounds - roundIndex;
    if (roundsFromEnd === 1) return "Finale";
    if (roundsFromEnd === 2) return "Demi-finales";
    if (roundsFromEnd === 3) return "Quarts de finale";
    if (roundsFromEnd === 4) return "8èmes de finale";
    return `Tour ${roundIndex + 1}`;
  };

  return (
    <div className="knockout-container">
      <h2 className="knockout-title">
        <Trophy className="w-6 h-6" />
        Tableau Final - Phase à Élimination Directe
      </h2>
      
      <div className="bracket-container">
        {knockoutMatches.map((round, roundIndex) => (
          <div key={roundIndex} className="bracket-round">
            <h3 className="round-name">{getRoundName(roundIndex, knockoutMatches.length)}</h3>
            <div className="round-matches">
              {round.map((match, matchIndex) => (
                <Card
                  key={matchIndex}
                  className={`bracket-match ${
                    match.player1 && match.player2 && !match.winner ? 'clickable' : ''
                  } ${match.winner ? 'completed' : ''}`}
                  onClick={() => handleMatchClick(roundIndex, matchIndex, match)}
                >
                  <CardContent className="bracket-match-content">
                    <div className={`bracket-player ${match.winner === match.player1 ? 'winner' : match.winner ? 'loser' : ''}`}>
                      <span>{match.player1 || "À déterminer"}</span>
                      {match.score1 !== undefined && <span className="bracket-score">{match.score1}</span>}
                    </div>
                    <div className="bracket-vs">VS</div>
                    <div className={`bracket-player ${match.winner === match.player2 ? 'winner' : match.winner ? 'loser' : ''}`}>
                      <span>{match.player2 || "À déterminer"}</span>
                      {match.score2 !== undefined && <span className="bracket-score">{match.score2}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={selectedMatch !== null} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Entrer le score du match</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="score-input-container">
              <div className="score-input-group">
                <Label htmlFor="score1">{selectedMatch.match.player1}</Label>
                <Input
                  id="score1"
                  type="number"
                  min="0"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  placeholder="Buts"
                />
              </div>
              <div className="score-vs">VS</div>
              <div className="score-input-group">
                <Label htmlFor="score2">{selectedMatch.match.player2}</Label>
                <Input
                  id="score2"
                  type="number"
                  min="0"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  placeholder="Buts"
                />
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Note : Les matchs nuls ne sont pas autorisés en phase finale.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveScore} 
              disabled={score1 === "" || score2 === "" || score1 === score2}
            >
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnockoutStage;
