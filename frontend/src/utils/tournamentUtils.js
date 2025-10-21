// Create balanced groups with minimum 3 players per group
export const createGroups = (players) => {
  const numPlayers = players.length;
  let numGroups;
  let groupSizes = [];

  // Determine optimal number of groups
  if (numPlayers < 3) {
    numGroups = 1;
    groupSizes = [numPlayers];
  } else if (numPlayers <= 5) {
    numGroups = 1;
    groupSizes = [numPlayers];
  } else if (numPlayers <= 8) {
    numGroups = 2;
    const baseSize = Math.floor(numPlayers / 2);
    const remainder = numPlayers % 2;
    groupSizes = remainder === 0 ? [baseSize, baseSize] : [baseSize + 1, baseSize];
  } else if (numPlayers === 9) {
    numGroups = 3;
    groupSizes = [3, 3, 3];
  } else if (numPlayers === 10) {
    numGroups = 2;
    groupSizes = [5, 5];
  } else if (numPlayers === 11) {
    numGroups = 3;
    groupSizes = [4, 4, 3];
  } else {
    // For 12+ players, aim for groups of 4
    numGroups = Math.floor(numPlayers / 4);
    const baseSize = 4;
    const remainder = numPlayers % 4;
    
    groupSizes = Array(numGroups).fill(baseSize);
    
    // Distribute remainder
    if (remainder === 1) {
      // Add 1 to first group to make it 5
      groupSizes[0] += 1;
    } else if (remainder === 2) {
      // Add 1 to first two groups
      groupSizes[0] += 1;
      groupSizes[1] += 1;
    } else if (remainder === 3) {
      // Create an additional group of 3
      groupSizes.push(3);
      numGroups += 1;
    }
  }

  // Shuffle players
  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

  // Create groups
  const groups = [];
  let playerIndex = 0;

  for (let i = 0; i < numGroups; i++) {
    const groupPlayers = shuffledPlayers.slice(playerIndex, playerIndex + groupSizes[i]);
    playerIndex += groupSizes[i];

    const groupName = `Poule ${String.fromCharCode(65 + i)}`;
    const matches = generateGroupMatches(groupPlayers);
    const standings = groupPlayers.map((name) => ({
      name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      diff: 0,
      points: 0,
    }));

    groups.push({
      name: groupName,
      players: groupPlayers,
      matches,
      standings,
    });
  }

  return groups;
};

// Generate all matches for a group (round-robin)
export const generateGroupMatches = (players) => {
  const matches = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        player1: players[i],
        player2: players[j],
        score1: null,
        score2: null,
        played: false,
      });
    }
  }
  return matches;
};

// Update group standings based on matches
export const updateGroupStandings = (players, matches) => {
  const standings = players.map((name) => ({
    name,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    diff: 0,
    points: 0,
  }));

  matches.forEach((match) => {
    if (match.played) {
      const player1Stats = standings.find((s) => s.name === match.player1);
      const player2Stats = standings.find((s) => s.name === match.player2);

      player1Stats.played += 1;
      player2Stats.played += 1;

      player1Stats.goalsFor += match.score1;
      player1Stats.goalsAgainst += match.score2;
      player2Stats.goalsFor += match.score2;
      player2Stats.goalsAgainst += match.score1;

      if (match.score1 > match.score2) {
        player1Stats.won += 1;
        player1Stats.points += 3;
        player2Stats.lost += 1;
      } else if (match.score1 < match.score2) {
        player2Stats.won += 1;
        player2Stats.points += 3;
        player1Stats.lost += 1;
      } else {
        player1Stats.drawn += 1;
        player1Stats.points += 1;
        player2Stats.drawn += 1;
        player2Stats.points += 1;
      }
    }
  });

  // Calculate goal difference
  standings.forEach((s) => {
    s.diff = s.goalsFor - s.goalsAgainst;
  });

  // Sort standings
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.diff !== a.diff) return b.diff - a.diff;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
};

// Generate adaptive knockout bracket
export const generateKnockoutBracket = (qualifiedPlayers) => {
  const playerNames = qualifiedPlayers.map((p) => p.name);
  const numPlayers = playerNames.length;

  // Shuffle players
  const shuffled = [...playerNames].sort(() => Math.random() - 0.5);

  // Create rounds based on number of qualified players
  const rounds = [];
  let currentRound = [];

  // First round - pair all qualified players
  for (let i = 0; i < shuffled.length; i += 2) {
    currentRound.push({
      player1: shuffled[i],
      player2: shuffled[i + 1],
      score1: undefined,
      score2: undefined,
      winner: null,
    });
  }
  rounds.push(currentRound);

  // Create subsequent rounds until we reach the final
  let matchesInNextRound = currentRound.length / 2;
  while (matchesInNextRound >= 1) {
    const nextRound = [];
    for (let i = 0; i < matchesInNextRound; i++) {
      nextRound.push({
        player1: null,
        player2: null,
        score1: undefined,
        score2: undefined,
        winner: null,
      });
    }
    rounds.push(nextRound);
    matchesInNextRound /= 2;
  }

  return rounds;
};
