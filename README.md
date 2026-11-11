# ENARSI 300-410 Last-Minute Study Map

A single-page, mobile-first study tool for the Cisco **CCNP ENARSI 300-410** exam, aligned to the official **exam topics v1.1** (4 domains, 25 sub-objectives).

Open `index.html` in a browser. It's fully self-contained (one HTML file, no build step needed to use it). Progress is saved in your browser's localStorage.
Live page: https://lv-dang.github.io/enarsi-study-map/

## What's inside

| Tab | Content |
|---|---|
| **Overview** | Domain weights, a readiness panel, 33 deep-dive panels with 42 topology/step diagrams, and 32 config blocks (configuration · sample output · troubleshooting commands) covering every sub-objective |
| **Trigger cards** | 228 flip cards (incl. 47 symptom → cause cards) with spaced repetition |
| **Scenario quiz** | 272 questions: single answer, choose two, ordering and matching; 67 with CLI exhibits. Practice (weighted by exam domain), retry wrong, weak topics, and a 60-question / 90-minute mock exam |
| **Numbers** | Ports, timers, AD, metrics, LSA types, BGP attributes, ranges and defaults, grouped by sub-objective, with grids for patterned values |
| **Exam day** | Pacing plan, one line per official sub-objective, classic traps |
| **Search** | Full-text search across cards, quiz, panels and numbers |

### Readiness rule (a heuristic, not a guarantee)

Per domain: ≥80 % of quiz questions seen, ≥85 % right on the first try, and ≥20 % practiced in the last 14 days. Plus one mock exam ≥85 % within the last 14 days. Cisco doesn't publish the question count or cut score; ~55–65 questions and ~750–850/1000 are third-party estimates.

### Blueprint v1.1 notes

v1.1 added VRF/global context to EIGRP, unicast/VRF-Lite to BGP, telemetry to logging and IPFIX to NetFlow, and renamed Cisco DNA Center to Catalyst Center. NetFlow v5 was dropped and isn't covered (except as a wrong answer option).

## Sources

Facts are tagged with their source on the page: ENARSI Official Cert Guide (OCG), ENARSI course student guide (CSLG), CCNP/CCIE Enterprise Portable Command Guide (PCG), NetAcad ENARSI slides, INE exam review, Pluralsight, ITProTV. Where sources disagree (e.g. RADIUS 1645/1646 vs 1812/1813, NetFlow default export port), both values are shown.

All quiz questions are original. Sample CLI outputs follow the formats in the books but are trimmed and use invented addresses; the Catalyst Center view and the telemetry output are marked as illustrative.

Progress is keyed by a hash of each item's text, so editing a question's scenario or a card's front resets progress for that item only.

## License

MIT, see [LICENSE](LICENSE). Cisco, CCNP and Catalyst Center are trademarks of Cisco Systems, Inc. This project isn't affiliated with or endorsed by Cisco.
