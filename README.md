<h1 align="center">Who's Up</h1>

<p align="center">
  <strong>See who's around — without asking</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-ISC-4ADE80" />
  <img src="https://img.shields.io/badge/node-≥20-22D3EE" />
  <img src="https://img.shields.io/badge/discord.js-v14-A78BFA" />
</p>

<p align="center">
  <img src="docs/images/whos-up-overview.png" width="320" />
</p>

## About

A Discord bot that quietly shows who might be around to play — now or later. No scheduling. No pressure.

See the vibe before you ask.

## Features

- `/soon` - Check who's around to play now (closes in 30 min)
- `/later <time>` - Check who's around at a specific time (closes in 24h)
- Reaction-based voting (one vote per user)
- DM notification when enough players are available

## Quick Start

1. **Add the bot to your server**

   Coming soon

2. **Use the commands**

   `/soon` or `/later 8pm` to start a poll

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
