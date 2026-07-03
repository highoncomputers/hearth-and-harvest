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

### Session 2 (July 3, 2026)
- Phase 2 Core Systems: 9/12 tasks
- Inventory, UI panels, Resources, Items

### Session 3 (July 3, 2026)
- Phase 3 Combat: 12/14 tasks completed
- Created CombatSystem.js, Enemy.js, Bandit.js, Wolf.js, Boar.js
- Enemy telegraphs, lock-on, weapon scaling, hitstop, loot drops

### Session 4 (July 3, 2026)
- **Phase 3 completed**: Armor system + Bow combat
- **Phase 4 completed**: 7-zone hub world with zone gates
- Armor system: leather/chain/plate armors with helm+boots slots, damage reduction formula (defense/(defense+50))
- Bow combat: ArrowEntity with physics projectile, consumes arrows from inventory, hunting skill scaling
- ZoneManager: per-zone terrain seeds, resource/enemy spawning, prop generation
- 7 zones: Village Hub, Forest, Riverlands, Farmlands, Iron Mine, Bandit Camp, Old Ruins
- Zone gates: glowing archways at zone borders with interact-to-travel
- Zone transitions: loading screen with progress steps, player teleport after terrain regen
- 8 armor variants added to ITEM_DEFS (3 body + 2 head + 2 boots + shield)
- Bow button added to TouchControls, R key for ranged on keyboard
- Duplicate barley key fixed in Inventory.js
- Keyboard lock-on remapped from Tab to Tab (was incorrectly set)
- Bow shoot procedural sound added to AudioManager

## Current State
- All 7 zones playable with zone gate travel between them
- Zone gates show "[E] Travel to..." prompts when near
- Each zone has unique terrain seed, resource types/density, enemy types/density, tree/rock props
- Armor reduces damage via defense formula; bow fires physics arrows
- All Phase 3 (14/14) and Phase 4 (14/14) tasks complete
- Build passes cleanly (3 chunks: three.js 533KB, cannon-es 87KB, game 131KB)

## What's Next
- Phase 5: Farming & crafting system (soil tilling, planting, watering, growth cycles, crop rotation bonus, fertilizer, cooking recipes, tool crafting with tier upgrades)
- Phase 6: NPCs & barter economy (procedural NPC generation, desire profiles, barter UI, daily routines, quest givers)
- Phase 7: Polish & content (save/load zones, loot tables, achievements, tutorials, game over screen, credits sequence, music tracks, particle effects, performance optimization, PWA manifest)

## Key Architecture Notes
- ZoneManager owns per-zone resources[], enemies[], propGroups[], zoneGates[]
- Game.js routes updates through zoneManager when available
- ZoneManager.transitionTo accepts onReady callback for player teleport after terrain regen
- Player starts in Village Hub with iron_sword, wood_shield, bow, 20 arrows, leather_armor, iron_helm, leather_boots
- Enemy base class auto-registers with CombatSystem via `combat:registerEnemy` event
- ArrowEntity takes `{ enemies, events }` as source for hit detection and event emission

## Known Issues
- Zone gate labels use fixed screen position (mid-screen) since worldToScreen not properly implemented
- No zone-specific buildings/props beyond trees and rocks
- Enemy aggro range doesn't respect zone boundaries
- No save/load of zone state

## Commands
```bash
cd /root/opencode/hearth-and-harvest && npm run dev
cd /root/opencode/hearth-and-harvest && npm run build
```
