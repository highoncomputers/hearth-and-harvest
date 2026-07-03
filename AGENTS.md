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
- Phase 2 Core Systems: 9/12 tasks completed
- Created Inventory system with full item definitions (30+ items across 6 categories)
- Created InventoryUI with 30-slot grid, drag-and-drop, categories, durability bars
- Created MainMenu (New Game, Continue, Settings, Credits)
- Created PauseMenu (Resume, Save, Load, Settings, Quit)
- Created SettingsPanel (graphics quality tiers, master/music/SFX sliders, controls info)
- Created ResourceNode entity (tree, rock, iron_ore, bush, clay, flax with harvest/respawn)
- Created ItemEntity (dropped items on ground with bob/glow/animation)
- Updated Game.js with full menu flow, inventory toggle, resource spawning, item pickup/prompt
- Fixed vite.config.js for Vite 8 compatibility (eval removed from MainMenu)

## Current State
- Full game flow: Main Menu → New Game/Continue → Gameplay → Pause/Inventory/Settings
- 40+ resource nodes spawn on terrain (trees, rocks, bushes, ore, clay, flax)
- Items can be picked up from ground (interact prompt shows, [E] to pick up)
- Inventory UI with 30-slot grid, 6 categories, drag-and-drop, durability display
- Main menu with New Game, Continue, Settings, Credits
- Pause menu with Resume, Save, Load, Settings, Quit to Menu
- Settings with 5 graphics quality tiers and audio volume sliders

## What's Next
- Phase 2 remaining: Zone loading system (hub + 6 zones with fade transitions)
- Then Phase 3: Combat (lock-on, combos, enemy AI, weapon tiers, armor)

## Known Issues
- Resource respawning needs timer tuning
- Touch controls repositioning on orientation change needs testing
- Zone system still loads single world -- multi-zone gates not yet implemented

## Commands
```bash
# Dev server
cd /root/opencode/hearth-and-harvest && npm run dev

# Build
cd /root/opencode/hearth-and-harvest && npm run build

# Preview build
cd /root/opencode/hearth-and-harvest && npm run preview
```
