import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, ArrowRight } from "lucide-react";

const TournamentConfig = ({ onStart }) => {
  const [numPlayers, setNumPlayers] = useState("");
  const [playerNames, setPlayerNames] = useState([]);
  const [showNameInputs, setShowNameInputs] = useState(false);

  const handleNumPlayersSubmit = () => {
    const num = parseInt(numPlayers);
    if (num && num >= 2) {
      setPlayerNames(Array(num).fill(""));
      setShowNameInputs(true);
    }
  };

  const handleNameChange = (index, value) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStartTournament = () => {
    const validNames = playerNames.filter((name) => name.trim() !== "");
    if (validNames.length >= 2) {
      onStart(validNames);
    }
  };

  const allNamesFilled = playerNames.every((name) => name.trim() !== "");

  return (
    <div className="config-container">
      <Card className="config-card">
        <CardHeader>
          <CardTitle className="config-title">
            <Users className="w-6 h-6" />
            Configuration du Tournoi
          </CardTitle>
        </CardHeader>
        <CardContent className="config-content">
          {!showNameInputs ? (
            <div className="num-players-input">
              <Label htmlFor="numPlayers" className="config-label">
                Combien de joueurs participent au tournoi ?
              </Label>
              <div className="input-group">
                <Input
                  id="numPlayers"
                  type="number"
                  min="2"
                  value={numPlayers}
                  onChange={(e) => setNumPlayers(e.target.value)}
                  placeholder="Entrez le nombre de joueurs"
                  className="number-input"
                />
                <Button
                  onClick={handleNumPlayersSubmit}
                  disabled={!numPlayers || parseInt(numPlayers) < 2}
                  className="submit-button"
                >
                  Suivant <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="players-list">
              <h3 className="players-list-title">
                Entrez le nom de chaque joueur :
              </h3>
              <div className="names-grid">
                {playerNames.map((name, index) => (
                  <div key={index} className="name-input-wrapper">
                    <Label htmlFor={`player-${index}`} className="name-label">
                      Joueur {index + 1}
                    </Label>
                    <Input
                      id={`player-${index}`}
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`Nom du joueur ${index + 1}`}
                      className="name-input"
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleStartTournament}
                disabled={!allNamesFilled}
                className="start-button"
              >
                Valider les inscriptions et commencer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentConfig;
