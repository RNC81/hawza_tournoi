import { useState, useEffect } from "react";
import "./App.css";
import TournamentConfig from "./components/TournamentConfig";
import GroupStage from "./components/GroupStage";
import QualifiedPlayers from "./components/QualifiedPlayers";
import KnockoutStage from "./components/KnockoutStage";
import { Button } from "./components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";

function App() {
  const [tournamentState, setTournamentState] = useState("config"); // config, groups, qualified, knockout, finished
  const [players, setPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [qualifiedPlayers, setQualifiedPlayers] = useState([]);
  const [knockoutMatches, setKnockoutMatches] = useState([]);
  const [winner, setWinner] = useState(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("tournamentState");
    if (savedState) {
      const data = JSON.parse(savedState);
      setTournamentState(data.tournamentState || "config");
      setPlayers(data.players || []);
      setGroups(data.groups || []);
      setQualifiedPlayers(data.qualifiedPlayers || []);
      setKnockoutMatches(data.knockoutMatches || []);
      setWinner(data.winner || null);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const data = {
      tournamentState,
      players,
      groups,
      qualifiedPlayers,
      knockoutMatches,
      winner,
    };
    localStorage.setItem("tournamentState", JSON.stringify(data));
  }, [tournamentState, players, groups, qualifiedPlayers, knockoutMatches, winner]);

  const resetTournament = () => {
    setTournamentState("config");
    setPlayers([]);
    setGroups([]);
    setQualifiedPlayers([]);
    setKnockoutMatches([]);
    setWinner(null);
    localStorage.removeItem("tournamentState");
  };

  return (
    <div className="App">
      <div className="tournament-header">
        <h1 className="tournament-title">⚽ EA FC 26 - Gestionnaire de Tournoi</h1>
        {tournamentState !== "config" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="reset-button">
                <RotateCcw className="w-4 h-4 mr-2" />
                Réinitialiser le tournoi
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action effacera toutes les données du tournoi actuel
                  (joueurs, scores, poules, tableau final). Cette action est
                  irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={resetTournament}>
                  Oui, tout recommencer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="tournament-content">
        {tournamentState === "config" && (
          <TournamentConfig
            onStart={(playerNames) => {
              setPlayers(playerNames);
              setTournamentState("groups");
            }}
          />
        )}

        {tournamentState === "groups" && (
          <GroupStage
            players={players}
            groups={groups}
            setGroups={setGroups}
            onComplete={(qualified) => {
              setQualifiedPlayers(qualified);
              setTournamentState("qualified");
            }}
          />
        )}

        {tournamentState === "qualified" && (
          <QualifiedPlayers
            qualifiedPlayers={qualifiedPlayers}
            allPlayers={players}
            onStartKnockout={(matches) => {
              setKnockoutMatches(matches);
              setTournamentState("knockout");
            }}
          />
        )}

        {tournamentState === "knockout" && (
          <KnockoutStage
            knockoutMatches={knockoutMatches}
            setKnockoutMatches={setKnockoutMatches}
            onFinish={(winnerName) => {
              setWinner(winnerName);
              setTournamentState("finished");
            }}
          />
        )}

        {tournamentState === "finished" && winner && (
          <div className="winner-screen">
            <div className="winner-card">
              <h2 className="winner-title">🏆 Grand Vainqueur du Tournoi 🏆</h2>
              <div className="winner-name">{winner}</div>
              <p className="winner-subtitle">Félicitations !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
