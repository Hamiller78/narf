# N.A.R.F.

A browser-based TypeScript port of the NARF MetaBASIC prototype.

## Development

```text
npm install
npm run dev
```

Use the up/down cursor keys or W/S to move the decision marker. Space or Enter selects an option. Standard gamepads use the vertical axis or D-pad and the first button.

## Verification

```text
npm test
npm run build
```

The original MetaBASIC source and tests remain in `source` and `tests` as the behavioral reference for the port.

## Font

Departure Mono is designed by Helena Zhang and distributed under the SIL Open Font License 1.1. The font is bundled locally under `public/fonts`; no font service is contacted when the game runs. Its licence is retained in `public/licenses/DepartureMono-OFL.txt`.
