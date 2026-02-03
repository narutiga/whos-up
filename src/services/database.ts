import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import type { Poll, PollType, VoteType } from '../types/index.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'polls.db');

let db: Database.Database;

export function initDatabase(): void {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS polls (
      id TEXT PRIMARY KEY,
      channel_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      type TEXT NOT NULL,
      game TEXT,
      time TEXT,
      min_players INTEGER NOT NULL,
      threshold_notified INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      closed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS votes (
      poll_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      vote_type TEXT NOT NULL,
      PRIMARY KEY (poll_id, user_id),
      FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
    );
  `);
}

interface PollRow {
  id: string;
  channel_id: string;
  author_id: string;
  type: string;
  game: string | null;
  time: string | null;
  min_players: number;
  threshold_notified: number;
  created_at: number;
  expires_at: number;
  closed: number;
}

interface VoteRow {
  poll_id: string;
  user_id: string;
  vote_type: string;
}

export function savePoll(poll: Poll): void {
  const stmt = db.prepare(`
    INSERT INTO polls (id, channel_id, author_id, type, game, time, min_players, threshold_notified, created_at, expires_at, closed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    poll.id,
    poll.channelId,
    poll.authorId,
    poll.type,
    poll.game ?? null,
    poll.time ?? null,
    poll.minPlayers,
    poll.thresholdNotified ? 1 : 0,
    poll.createdAt.getTime(),
    poll.expiresAt.getTime(),
    poll.closed ? 1 : 0
  );
}

export function updatePollClosed(messageId: string): void {
  const stmt = db.prepare(`
    UPDATE polls SET closed = 1 WHERE id = ? AND closed = 0
  `);
  stmt.run(messageId);
}

export function updateThresholdNotified(messageId: string): void {
  const stmt = db.prepare(`
    UPDATE polls SET threshold_notified = 1 WHERE id = ?
  `);
  stmt.run(messageId);
}

export function saveVote(pollId: string, userId: string, voteType: VoteType): void {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO votes (poll_id, user_id, vote_type)
    VALUES (?, ?, ?)
  `);
  stmt.run(pollId, userId, voteType);
}

export function deleteVote(pollId: string, userId: string): void {
  const stmt = db.prepare(`
    DELETE FROM votes WHERE poll_id = ? AND user_id = ?
  `);
  stmt.run(pollId, userId);
}

export function getActivePolls(): Poll[] {
  const pollStmt = db.prepare(`
    SELECT * FROM polls WHERE closed = 0
  `);
  const voteStmt = db.prepare(`
    SELECT * FROM votes WHERE poll_id = ?
  `);

  const rows = pollStmt.all() as PollRow[];

  return rows.map((row) => {
    const votes = new Map<string, VoteType>();
    const voteRows = voteStmt.all(row.id) as VoteRow[];
    for (const vote of voteRows) {
      votes.set(vote.user_id, vote.vote_type as VoteType);
    }

    return {
      id: row.id,
      channelId: row.channel_id,
      authorId: row.author_id,
      type: row.type as PollType,
      game: row.game ?? undefined,
      time: row.time ?? undefined,
      minPlayers: row.min_players,
      thresholdNotified: row.threshold_notified === 1,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      closed: row.closed === 1,
      votes,
    };
  });
}
