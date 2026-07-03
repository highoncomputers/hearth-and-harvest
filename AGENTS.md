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
- Created CombatSystem.js — hit detection, stagger, hitstop, camera shake, knockback
- Created Enemy.js — full AI state machine (IDLE/PATROL/ALERT/CHASE/ATTACK/STAGGER/FLEE/DEAD)
- Created Bandit.js — patrols, chases, can block attacks, drops loot
- Created Wolf.js — fast pack hunter, pounce behavior, fleeing
- Created Boar.js — charging attack, high damage, aggressive
- Enemy telegraphs — red ring indicator before attack
- Lock-on targeting — toggle via Tab key or lockOn button, strafe movement
- Weapon damage scaling — iron sword + skill bonuses
- Hitstop on impact (0.04-0.2s freeze), camera shake proportional to damage
- Inventory: added iron_sword, wood_shield, bow, arrows as starting gear
- TouchControls: added lock-on button
- Enemies respawn when count drops below 5
- Loot drops on death (items spawn as ItemEntity on ground)

## Current State
- Full combat system: lock-on, light/heavy attacks, block, dodge, stagger, telegraphs, hitstop
- 11 enemies spawn initially (5 bandits, 4 wolves, 2 boars) with full AI states
- Combat includes stagger chains, knockback physics, weapon durability
- All previous systems (inventory, menu, resources, saves) still work

## What's Next
- Phase 3 remaining: Armor system, Bow combat
- Phase 4: World Zones (7 zones with transition gates)
- Phase 5: Farming & Crafting

## Known Issues
- No armor damage reduction implemented yet
- Bow combat needs arrow projectile implementation
- Enemy respawning could be more gradual

## Commands
```bash
# Dev server
cd /root/opencode/hearth-and-harvest && npm run dev

# Build
cd /root/opencode/hearth-and-harvest && npm run build

# Preview build
cd /root/opencode/hearth-and-harvest && npm run preview
```
