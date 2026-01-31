export type PollType = 'soon' | 'later';

export type VoteType = 'green' | 'yellow' | 'orange';

export interface Poll {
  id: string;                     // Message ID
  channelId: string;
  authorId: string;
  type: PollType;
  game?: string;
  time?: string;                  // For /later only
  minPlayers: number;
  votes: Map<string, VoteType>;   // userId -> vote
  thresholdNotified: boolean;
  createdAt: Date;
  expiresAt: Date;
  closed: boolean;
}

export interface VoteCounts {
  green: number;
  yellow: number;
  orange: number;
}
