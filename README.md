# Video Poker Trainer: 9/6 Jacks or Better

A web-based video poker training application that simulates "full pay" (9/6) Jacks or Better. Learn optimal strategy by receiving feedback on the best cards to hold for any given hand.

## Features

- **Realistic 9/6 Jacks or Better gameplay**
- **Betting system** start with 100 coins and bet 1-5 coins. You can reset if you run out.
- **Optimal strategy engine** using prioritized lookup table for best hold decisions, based on [wizardofodss.com](https://wizardofodds.com/games/video-poker/strategy/jacks-or-better/9-6/simple/).
- **Real-time feedback** comparing your plays to mathematically optimal strategy
- **Visual feedback** highlighting correct vs incorrect hold decisions

## Technology Stack

- **Vue.js 3** (Composition API)
- **TypeScript** for type safety
- **Pinia** for state management
- **TailwindCSS** for styling
- **Vite** for fast development and building
- **Sass** for advanced styling features

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd video-poker-2
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Build for production
```bash
npm run build
```

## How to Play

1. **Place Your Bet**: Use "Bet One" to cycle through 1-5 coins, or "Bet Max" for maximum bet
2. **Deal Cards**: Click "DEAL" to receive your initial 5-card hand
3. **Hold Cards**: Click cards or use hold buttons to select which cards to keep
4. **Draw**: Click "DRAW" to replace unheld cards with new ones
5. **Get Feedback**: See if your hold decision matched the mathematically optimal play

## Game Rules

### Paytable (9/6 Jacks or Better)

| Hand | 1 Coin | 2 Coins | 3 Coins | 4 Coins | 5 Coins |
|------|--------|---------|---------|---------|---------|
| Royal Flush | 250 | 500 | 750 | 1000 | **4000** |
| Straight Flush | 50 | 100 | 150 | 200 | 250 |
| Four of a Kind | 25 | 50 | 75 | 100 | 125 |
| Full House | **9** | 18 | 27 | 36 | 45 |
| Flush | **6** | 12 | 18 | 24 | 30 |
| Straight | 4 | 8 | 12 | 16 | 20 |
| Three of a Kind | 3 | 6 | 9 | 12 | 15 |
| Two Pair | 2 | 4 | 6 | 8 | 10 |
| Jacks or Better | 1 | 2 | 3 | 4 | 5 |

### Strategy Priority

The optimal strategy engine uses a prioritized lookup table to determine the best hold for any initial hand:

1. Royal Flush
2. Straight Flush
3. Four of a Kind
4. 4 to a Royal Flush
5. Full House
6. Flush
7. Straight
8. Three of a Kind
9. 4 to a Straight Flush (any number of gaps)
10. Two Pair
11. High Pair (Jacks or Better)
12. 3 to a Royal Flush
13. 4 to a Flush
14. Low Pair
15. 4 to an Outside Straight
16. 2 Suited High Cards
17. 3 to a Straight Flush (any number of gaps)
18. 2 Unsuited High Cards
19. Suited 10/J, 10/Q, or 10/K
20. One High Card
21. Discard Everything

## License

MIT License

## Acknowledgments

- Card images are original artwork created by me.
- Optimal strategy calculations from [wizardofodds.com](https://wizardofodds.com/).
- Mostly vibe coded with [Claude code](https://docs.anthropic.com/en/docs/claude-code/overview).