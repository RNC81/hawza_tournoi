import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Shuffle, Trophy } from "lucide-react";
import { createGroups, generateGroupMatches, updateGroupStandings } from "../utils/tournamentUtils";

const GroupStage = ({ players, groups, setGroups, onComplete }) => {
  const [groupsDrawn, setGroupsDrawn] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  useEffect(() => {
    if (groups && groups.length > 0) {
      setGroupsDrawn(true);
    }
  }, [groups]);

  const handleDrawGroups = () => {
    const newGroups = createGroups(players);
    setGroups(newGroups);
    setGroupsDrawn(true);
  };

  const handleMatchClick = (groupIndex, match) => {
    // Allow editing both unplayed and played matches
    setSelectedMatch({ groupIndex, match });
    // Pre-fill scores if match was already played
    if (match.played) {
      setScore1(match.score1.toString());
      setScore2(match.score2.toString());
    } else {
      setScore1("");
      setScore2("");
    }
  };

  const handleSaveScore = () => {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return;

    const newGroups = [...groups];
    const { groupIndex, match } = selectedMatch;
    
    // Update match
    const matchIndex = newGroups[groupIndex].matches.findIndex(
      (m) => m.player1 === match.player1 && m.player2 === match.player2
    );
    newGroups[groupIndex].matches[matchIndex] = {
      ...match,
      score1: s1,
      score2: s2,
      played: true,
    };

    // Update standings
    newGroups[groupIndex].standings = updateGroupStandings(
      newGroups[groupIndex].players,
      newGroups[groupIndex].matches
    );

    setGroups(newGroups);
    setSelectedMatch(null);
  };

  const allMatchesPlayed = () => {
    return groups.every((group) => group.matches.every((match) => match.played));
  };

  const handleCompleteGroups = () => {
    // New intelligent qualification logic
    const totalPlayers = players.length;
    let targetQualified;

    // Determine target number of qualified players
    if (totalPlayers <= 8) {
      targetQualified = 4;
    } else if (totalPlayers <= 16) {
      targetQualified = 8;
    } else {
      targetQualified = 16;
    }

    const qualified = [];
    const thirdPlaced = [];

    // Step 1: Take top 2 from each group
    groups.forEach((group) => {
      qualified.push(...group.standings.slice(0, 2));
      // Collect third-placed players if they exist
      if (group.standings[2]) {
        thirdPlaced.push(group.standings[2]);
      }
    });

    // Step 2: If we need more players, add best third-placed
    if (qualified.length < targetQualified && thirdPlaced.length > 0) {
      // Sort third-placed players by ranking criteria
      thirdPlaced.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.diff !== a.diff) return b.diff - a.diff;
        return b.goalsFor - a.goalsFor;
      });

      const needed = targetQualified - qualified.length;
      qualified.push(...thirdPlaced.slice(0, needed));
    }

    // If still not enough (edge case), take more players from groups
    if (qualified.length < targetQualified) {
      groups.forEach((group) => {
        for (let i = 3; i < group.standings.length && qualified.length < targetQualified; i++) {
          if (!qualified.find(p => p.name === group.standings[i].name)) {
            qualified.push(group.standings[i]);
          }
        }
      });
    }

    // Limit to target number
    const finalQualified = qualified.slice(0, targetQualified);

    onComplete(finalQualified);
  };

  return (
    <div className="groups-container">
      {!groupsDrawn ? (
        <Card className="draw-card">
          <CardContent className="draw-content">
            <Button onClick={handleDrawGroups} size="lg" className="draw-button">
              <Shuffle className="w-5 h-5 mr-2" />
              Lancer le tirage au sort des poules
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="groups-grid">
            {groups.map((group, groupIndex) => (
              <Card key={groupIndex} className="group-card">
                <CardHeader>
                  <CardTitle className="group-title">{group.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Joueur</TableHead>
                        <TableHead className="text-center">J</TableHead>
                        <TableHead className="text-center">G</TableHead>
                        <TableHead className="text-center">N</TableHead>
                        <TableHead className="text-center">P</TableHead>
                        <TableHead className="text-center">BP</TableHead>
                        <TableHead className="text-center">BC</TableHead>
                        <TableHead className="text-center">Diff</TableHead>
                        <TableHead className="text-center">Pts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.standings.map((player, idx) => (
                        <TableRow key={idx} className={idx < 2 ? "qualified-row" : ""}>
                          <TableCell className="font-medium">
                            {idx < 2 && <Trophy className="w-4 h-4 inline mr-1 text-teal-400" />}
                            {player.name}
                          </TableCell>
                          <TableCell className="text-center">{player.played}</TableCell>
                          <TableCell className="text-center">{player.won}</TableCell>
                          <TableCell className="text-center">{player.drawn}</TableCell>
                          <TableCell className="text-center">{player.lost}</TableCell>
                          <TableCell className="text-center">{player.goalsFor}</TableCell>
                          <TableCell className="text-center">{player.goalsAgainst}</TableCell>
                          <TableCell className="text-center">{player.diff > 0 ? '+' : ''}{player.diff}</TableCell>
                          <TableCell className="text-center font-bold">{player.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="matches-section">
                    <h4 className="matches-title">Matchs</h4>
                    <div className="matches-list">
                      {group.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className={`match-item ${match.played ? 'played' : 'unplayed'} clickable`}
                          onClick={() => handleMatchClick(groupIndex, match)}
                        >
                          <span>{match.player1}</span>
                          <span className="match-score">
                            {match.played ? `${match.score1} - ${match.score2}` : "vs"}
                          </span>
                          <span>{match.player2}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {allMatchesPlayed() && (
            <div className="complete-section">
              <Button onClick={handleCompleteGroups} size="lg" className="complete-button">
                Terminer la phase de poules et voir les qualifiés
              </Button>
            </div>
          )}
        </>
      )}

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
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveScore} disabled={score1 === "" || score2 === ""}>
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GroupStage;
