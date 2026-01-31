import type { Client } from 'discord.js';

export async function sendThresholdNotification(
  client: Client,
  authorId: string,
  count: number
): Promise<boolean> {
  try {
    const user = await client.users.fetch(authorId);
    await user.send(`${count} people might be around.`);
    return true;
  } catch (error) {
    // User may have DMs disabled or bot lacks permissions
    console.warn(`Failed to send DM to user ${authorId}:`, error);
    return false;
  }
}
