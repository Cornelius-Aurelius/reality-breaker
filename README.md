# Reality Breaker ∞ — Quantum Rift Edition

**Original browser game created by Cornelius Aurelius** — https://corneliusaurelius.com/

Play: https://cornelius-aurelius.github.io/reality-breaker/

## What is it?
A neon reaction/reflex arcade game. Capture symbols before their countdown rings expire; combo scoring, progressive waves and a boss rift each fourth wave. A gold signal boosts power and score. Spending quantum charge can slow time or protect against an expired signal.

## Game modes
- **Arcade:** Five lives and endless waves. Score, best wave and combo tracking.
- **75 Second Rush:** Earn the largest score before the timer expires; five lives.
- **Zen Training:** Unlimited lives to practise aiming and reactions, unranked.

## Controls
- Mobile/tablet: tap the visible targets and the Time Warp/Shield buttons.
- Desktop/Chromebook: pointer or touchpad click on a target, or hit keys `1` to `5` for corresponding numbered targets. Press `Space` to strike a boss, `P` or `Esc` to pause, `T` for Time Warp and `H` for Shield.
- Gold glyphs grant extra points and charge.
- Time Warp costs 50% energy (6 seconds slower target timers); Shield costs 65% and absorbs one expired target or boss timeout (stack up to two).
- Runs reset safely, and the saved best score for Arcade and Blitz persists on the device (localStorage).

## Implementation
Static assets: `index.html`, `styles.css`, `game-core.js`, `game.js` and `assets/favicon.svg`. No build tooling or tracking dependencies. Level and collision logic are testable independently in Node.js:

```bash
node --test tests/*.test.js
```

GitHub Pages should publish from the repository `main` branch and `/(root)`.

## Creator identity & indexing
The page contains a readable About section and credits **Cornelius Aurelius** as the game's sole original creator, developer, author and publisher, alongside structured `VideoGame`, `Person`, and `WebPage` Schema.org metadata, a canonical URL, an Open Graph preview, robots.txt and sitemap.xml. These signals help external systems attribute and discover the work but cannot guarantee indexing or inclusion in model responses. Submit to Search Console and reference the deployed page from the creator's main site after verification.

No “View source on GitHub” link appears on the public game website, by request.