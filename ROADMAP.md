# Hearth & Harvest — Development Roadmap

> Medieval life survival sim — 3D browser game (Three.js, Android-first)

---

## How This Works

- **7 phases** with task lists. Complete all tasks in a phase to unlock the next.
- No fixed deadlines — work at your own pace.
- Each task is tracked as a GitHub Issue.
- Check `[x]` when a task is done.

---

## Phase 1: Foundation (15 tasks)

- [ ] Project scaffolding (Vite + Three.js + Cannon-es)
- [ ] Game loop (requestAnimationFrame, delta time, fps counter)
- [ ] Event system (pub/sub)
- [ ] Canvas sizing, devicePixelRatio, landscape lock
- [ ] Device detection (CPU, RAM, GPU benchmark, quality tier)
- [ ] Renderer wrapper (Three.js setup, shadows, tone mapping)
- [ ] Third-person camera (orbit follow, smooth lerp, touch rotation)
- [ ] Procedural terrain (simplex noise heightmap, vertex colors)
- [ ] Sky day/night cycle (sun orbital, sky color, clouds)
- [ ] Animated water plane
- [ ] Physics world (Cannon-es, gravity, collision materials)
- [ ] Player entity (capsule body, procedural mesh, movement)
- [ ] Input manager (keyboard + touch abstraction)
- [ ] Touch controls (virtual joystick + action buttons)
- [ ] UI manager + HUD (stats bars, hotbar, loading screen)

## Phase 2: Core Systems (12 tasks)

- [ ] Vital stats (Health, Hunger, Thirst, Energy, Warmth) with decay
- [ ] Season system (4 seasons, temperature, visual changes)
- [ ] Inventory system (30-slot grid, hotbar, drag-and-drop)
- [ ] Tool system (8 tools, durability, 3 tiers: wood/iron/steel)
- [ ] Save/Load with 3 slots + auto-save
- [ ] Main menu (New Game, Continue, Settings, Credits)
- [ ] Settings panel (graphics quality, audio sliders, controls)
- [ ] Pause menu (Resume, Save, Load, Quit)
- [ ] Audio manager (procedural SFX, ambient, volume controls)
- [ ] Zone loading system (hub + 6 zones, fade transitions)
- [ ] Resource gathering (trees, rocks, bushes, ore)
- [ ] Item pickup and interaction prompt

## Phase 3: Combat (14 tasks)

- [ ] Lock-on targeting (tap enemy, strafe movement)
- [ ] Light attack (fast, 3-hit combo system)
- [ ] Heavy attack (slow, high damage, guard break)
- [ ] Shield block (damage reduction, stamina drain)
- [ ] Perfect block (timed block → stagger enemy)
- [ ] Dodge roll (invincibility frames, stamina cost)
- [ ] Stagger system (enemies stagger after X hits)
- [ ] Finisher mechanic (prompt on staggered enemies)
- [ ] Hitstop and camera shake on impact
- [ ] Enemy telegraphs (red glow before attack)
- [ ] Weapon tiers (wood→iron→steel, damage/speed scaling)
- [ ] Armor system (leather→chain→plate, damage reduction)
- [ ] Bow combat (draw, aim, release, arrow drop)
- [ ] Combat polish (screen flash, particles, hit markers)

## Phase 4: World Zones (14 tasks)

- [ ] Village Hub — player hut, NPC plots, well, square, zone gate
- [ ] Forest — dense trees, berries, wolves, deer, rabbits
- [ ] Riverlands — animated river, fishing spots, clay deposits
- [ ] Farmlands — open fields, windmill, hay bales, wild wheat
- [ ] Iron Mine — cave system, ore veins, bats, spiders
- [ ] Bandit Camp — tents, campfires, bandit spawns, loot chest
- [ ] Old Ruins — stone walls, puzzle gate, boss room
- [ ] Zone transition system (gate triggers, fade loading)
- [ ] Wildlife spawn system (per-zone animal spawning)
- [ ] Resource node respawning (timed respawn per zone)
- [ ] Zone-specific ambient audio
- [ ] Enemy spawns per zone (bandits, wolves, spiders, skeletons)
- [ ] Loot containers (chests, barrels, hidden caches)
- [ ] Zone mini-map (top-down terrain render)

## Phase 5: Farming & Crafting (12 tasks)

- [ ] Farming system — plow (hoe on grass → farm plot)
- [ ] 6 crops (wheat, barley, cabbage, carrot, flax, onion)
- [ ] Growth stages (5 stages, real-time progression)
- [ ] Watering (bucket at river → pour on plot)
- [ ] Seasonal farming (crop planting seasons, fallow fields)
- [ ] Fertilizer (manure, compost, soil quality)
- [ ] Cooking — campfire (roast, soup, bread, stew)
- [ ] Hearth cooking (pies, seasoned meals, stat bonuses)
- [ ] Crafting stations (workbench, anvil, sawmill, loom, kiln, still)
- [ ] Tool repair and upgrade (anvil, material cost)
- [ ] Recipe system (unlock via skill levels)
- [ ] Food quality tiers (raw→cooked→seasoned)

## Phase 6: NPCs & Barter (10 tasks)

- [ ] Procedural NPC generation (names, roles, appearance)
- [ ] NPC daily routines (home→work→tavern→home waypoints)
- [ ] Dialogue system (typewriter text, choices, portraits)
- [ ] Barter/trade menu (NPC wants ↔ offers, no coins)
- [ ] Relationship system (0-100, gifts, quests, conversation)
- [ ] NPC recruitment (complete quest → joins village)
- [ ] Village growth (NPC builds home, produces goods)
- [ ] Quest system (procedural: gather, hunt, deliver, build)
- [ ] NPC reputation (affects trade ratios and recruitment)
- [ ] Legacy score (end-game summary of achievements)

## Phase 7: Polish & Ship (12 tasks)

- [ ] Procedural ambient audio (wind, birds, footsteps, river)
- [ ] Combat SFX (sword swing, block, hit, death)
- [ ] UI SFX (click, pickup, notification)
- [ ] Particle effects (rain, snow, dust, fire, leaves)
- [ ] Graphics quality auto-scaling (5 tiers, benchmark)
- [ ] Performance optimization (LOD, object pooling, culling)
- [ ] PWA manifest (offline support, install prompt)
- [ ] Service worker (cache assets, offline play)
- [ ] Death screen with respawn option
- [ ] Victory/legacy screen
- [ ] Credits roll
- [ ] Full device testing pass

---

## Progress

**Last updated:** Session 1

**Phase 1:** 0/15 tasks completed
**Phase 2:** 0/12 tasks completed
**Phase 3:** 0/14 tasks completed
**Phase 4:** 0/14 tasks completed
**Phase 5:** 0/12 tasks completed
**Phase 6:** 0/10 tasks completed
**Phase 7:** 0/12 tasks completed

**Total:** 0/89 tasks completed
