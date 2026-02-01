# Who's Up

See who's around — without asking.

![Who's Up Overview](docs/images/whos-up-overview.png)

## About

A Discord bot that quietly shows who might be around to play — now or later. No scheduling. No pressure.

See the vibe before you ask.

## Features

- `/soon` - Check who's around to play now (closes in 30 min)
- `/later <time>` - Check who's around at a specific time (closes in 24h)
- Reaction-based voting (one vote per user)
- DM notification when enough players are available

## Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Enable "Server Members Intent" in the bot settings

### 2. Install

```bash
git clone https://github.com/narutiga/whos-up.git
cd whos-up
pnpm install
```

### 3. Configure

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
```

### 4. Run

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

## Commands

### /soon

Check who might be around to play now.

| Option | Description | Default |
|--------|-------------|---------|
| `min_players` | Minimum players to notify | 3 |
| `game` | Game name to display | - |

### /later

Check who might be around at a specific time.

| Option | Description | Default |
|--------|-------------|---------|
| `time` | When to play (e.g., "8pm", "tonight") | Required |
| `min_players` | Minimum players to notify | 3 |
| `game` | Game name to display | - |

## License

[ISC](LICENSE)
