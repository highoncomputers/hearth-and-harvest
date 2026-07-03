# Session Context — Hearth & Harvest

## Project Summary
Medieval life survival sim — third-person 3D browser game built with Three.js + Cannon-es. Mobile Android-first with touch controls, desktop keyboard fallback.

## Session History

### Session 1 (July 3, 2026)
- GitHub repo created: `highoncomputers/hearth-and-harvest`
- Project scaffolded with Vite + Three.js + Cannon-es
- Full source structure created (core, graphics, physics, entities, controls, ui, utils)
- Implemented: config, EventSystem, InputManager, AudioManager, SaveManager, SceneManager
- Implemented: Renderer, Camera, Terrain, SkyCycle, Water
- Implemented: Physics (Cannon-es wrapper), Entity base, Player
- Implemented: VirtualJoystick, ActionButton, TouchControls
- Implemented: UIManager, HUD, LoadingScreen
- Implemented: main.js entry point, index.html, vite.config.js
- ROADMAP.md with 7 phases, 89 tasks
- AGENTS.md session context system
- First commit pushed to main

## Current State
- Game initializes and runs (game loop, terrain, sky, water, player, input, touch controls)
- Player can move, jump, attack, block, dodge
- Day/night cycle and season system
- Vital stats with HUD display
- Touch controls with virtual joystick + action buttons
- Audio with procedural SFX generation
- Save/load with auto-save

## What's Next
Phase 1 remaining tasks (unchecked in ROADMAP.md):
- The code is written but needs Git tracking. First large commit done.
- Next session: test the build, fix any issues, then begin working through unchecked Phase 1 tasks (zone loading system, etc.) or move to Phase 2.

## Pending Decisions
- None yet — all design decisions made.

## Known Issues
- Physics capsule shape may need tuning for player movement feel
- Touch control layout needs responsive repositioning on orientation change
- Player mesh is procedural — can enhance with more detail later
- AudioContext autoplay policy: must resume on first user interaction (handled in AudioManager)

## Commands
```bash
# Dev server
cd /root/opencode/hearth-and-harvest && npm run dev

# Build
cd /root/opencode/hearth-and-harvest && npm run build

# Preview build
cd /root/opencode/hearth-and-harvest && npm run preview
```
