
import { Team, Match, LeagueSettings, TeamStanding, Player, UserRole } from '../types';

const API_URL = 'http://localhost:3000/api/data';
const LOCAL_STORAGE_KEY = 'vleague_data_backup';

export const DEFAULT_SETTINGS: LeagueSettings = {
  minAge: 16,
  maxAge: 40,
  minPlayers: 15,
  maxPlayers: 22,
  maxForeignPlayers: 3,
  maxGoalTime: 90,
  pointsWin: 3,
  pointsDraw: 1,
  pointsLoss: 0,
  goalTypes: ['A', 'B', 'C'],
  rankingPriority: ['points', 'goalDifference', 'totalGoals', 'awayGoals'],
  rolePermissions: {
    dashboard: [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER],
    teams: [UserRole.ADMIN, UserRole.TEAM_OWNER],
    clubs: [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER],
    schedule: [UserRole.ADMIN],
    results: [UserRole.ADMIN],
    standings: [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER],
    search: [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER],
    settings: [UserRole.ADMIN, UserRole.TEAM_OWNER],
    users: [UserRole.ADMIN],
    profile: [UserRole.ADMIN, UserRole.TEAM_OWNER, UserRole.VIEWER]
  }
};

export const loadData = async () => {
  // try {
  //   const response = await fetch(API_URL);
  //   const data = await response.json();
  //   if (!data.settings?.rolePermissions) {
  //     data.settings = { ...data.settings, rolePermissions: DEFAULT_SETTINGS.rolePermissions };
  //   }
  //   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  //   return data;
  // } catch (e) {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Invalid localStorage data, using defaults');
      }
    }
    return { teams: [], matches: [], settings: DEFAULT_SETTINGS };
  // }
};

export const saveData = async (data: any) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {}
};

export const calculateStandings = (teams: Team[], matches: Match[], settings: LeagueSettings): TeamStanding[] => {
  const standingsMap: Record<string, TeamStanding> = {};

  teams.forEach(team => {
    standingsMap[team.id] = {
      teamId: team.id, teamName: team.name, played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, goalDifference: 0, awayGoals: 0, points: 0, rank: 0
    };
  });

  matches.filter(m => m.isCompleted).forEach(m => {
    const t1 = standingsMap[m.team1Id];
    const t2 = standingsMap[m.team2Id];
    if (!t1 || !t2) return;

    t1.played++; t2.played++;
    t1.goalsFor += (m.score1 || 0); t1.goalsAgainst += (m.score2 || 0);
    t2.goalsFor += (m.score2 || 0); t2.goalsAgainst += (m.score1 || 0);
    t2.awayGoals += (m.score2 || 0);

    if (m.score1! > m.score2!) {
      t1.won++; t1.points += settings.pointsWin;
      t2.lost++; t2.points += settings.pointsLoss;
    } else if (m.score1! < m.score2!) {
      t2.won++; t2.points += settings.pointsWin;
      t1.lost++; t1.points += settings.pointsLoss;
    } else {
      t1.drawn++; t1.points += settings.pointsDraw;
      t2.drawn++; t2.points += settings.pointsDraw;
    }
  });

  const standings = Object.values(standingsMap).map(s => ({
    ...s, goalDifference: s.goalsFor - s.goalsAgainst
  }));

  standings.sort((a, b) => {
    for (const criterion of settings.rankingPriority) {
      if (criterion === 'points' && b.points !== a.points) return b.points - a.points;
      if (criterion === 'goalDifference' && b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      if (criterion === 'totalGoals' && b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      if (criterion === 'awayGoals' && b.awayGoals !== a.awayGoals) return b.awayGoals - a.awayGoals;
    }
    return 0;
  });

  return standings.map((s, idx) => ({ ...s, rank: idx + 1 }));
};

export const getTopScorers = (teams: Team[], matches: Match[]) => {
  const scorerMap: Record<string, { player: Player; teamName: string; goals: number }> = {};
  matches.filter(m => m.isCompleted).forEach(m => {
    m.goals.forEach(g => {
      if (!scorerMap[g.playerId]) {
        const team = teams.find(t => t.id === g.teamId);
        const player = team?.players.find(p => p.id === g.playerId);
        if (player) scorerMap[g.playerId] = { player, teamName: team?.name || '', goals: 0 };
      }
      if (scorerMap[g.playerId]) scorerMap[g.playerId].goals++;
    });
  });
  return Object.values(scorerMap).sort((a, b) => b.goals - a.goals);
};
