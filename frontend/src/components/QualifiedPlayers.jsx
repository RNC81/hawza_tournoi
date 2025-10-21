import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle, XCircle, Shuffle } from "lucide-react";
import { generateKnockoutBracket } from "../utils/tournamentUtils";

const QualifiedPlayers = ({ qualifiedPlayers, allPlayers, onStartKnockout }) => {
  const eliminatedPlayers = allPlayers.filter(
    (player) => !qualifiedPlayers.find((qp) => qp.name === player)
  );

  const handleDrawKnockout = () => {
    const bracket = generateKnockoutBracket(qualifiedPlayers);
    onStartKnockout(bracket);
  };

  const getRoundName = () => {
    const count = qualifiedPlayers.length;
    if (count <= 4) return "Demi-finales";
    if (count <= 8) return "Quarts de finale";
    if (count <= 16) return "8èmes de finale";
    return "Phase finale";
  };

  return (
    <div className="qualified-container">
      <div className="qualified-content">
        <Card className="qualified-card">
          <CardHeader>
            <CardTitle className="qualified-title">
              <CheckCircle className="w-6 h-6 text-teal-400" />
              Joueurs Qualifiés ({qualifiedPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="players-grid">
              {qualifiedPlayers.map((player, idx) => (
                <div key={idx} className="qualified-player-item">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>{player.name}</span>
                  <span className="player-stats">
                    {player.points} pts | {player.diff > 0 ? '+' : ''}{player.diff}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="eliminated-card">
          <CardHeader>
            <CardTitle className="eliminated-title">
              <XCircle className="w-6 h-6 text-red-400" />
              Joueurs Éliminés ({eliminatedPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="players-grid">
              {eliminatedPlayers.map((player, idx) => (
                <div key={idx} className="eliminated-player-item">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>{player}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="draw-knockout-section">
        <Button onClick={handleDrawKnockout} size="lg" className="draw-knockout-button">
          <Shuffle className="w-5 h-5 mr-2" />
          Lancer le tirage au sort des {getRoundName()}
        </Button>
      </div>
    </div>
  );
};

export default QualifiedPlayers;
