
export enum UserRole {
  ADMIN = 'Ban điều hành giải',
  TEAM_OWNER = 'Chủ đội bóng',
  VIEWER = 'Người xem'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  birthday: string;
  role: UserRole;
}

export enum PlayerType {
  DOMESTIC = 'Trong nước',
  FOREIGN = 'Ngoài nước'
}

export enum GoalType {
  A = 'A',
  B = 'B',
  C = 'C'
}

export interface Player {
  id: string;
  name: string;
  birthday: string;
  type: PlayerType;
  notes: string;
  goals: number;
}

export interface Team {
  id: string;
  name: string;
  homeStadium: string;
  players: Player[];
  ownerId?: string;
  registrationDate?: string;
}

export interface Goal {
  playerId: string;
  teamId: string;
  type: GoalType;
  time: number;
}

export interface Match {
  id: string;
  round: number;
  team1Id: string;
  team2Id: string;
  date: string;
  time: string;
  stadium: string;
  score1: number | null;
  score2: number | null;
  goals: Goal[];
  isCompleted: boolean;
}

export interface LeagueSettings {
  minAge: number;
  maxAge: number;
  minPlayers: number;
  maxPlayers: number;
  maxForeignPlayers: number;
  maxGoalTime: number;
  pointsWin: number;
  pointsDraw: number;
  pointsLoss: number;
  goalTypes: string[];
  rankingPriority: ('points' | 'goalDifference' | 'totalGoals' | 'awayGoals' | 'headToHead')[];
  rolePermissions: Record<string, UserRole[]>;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  awayGoals: number;
  points: number;
  rank: number;
}
