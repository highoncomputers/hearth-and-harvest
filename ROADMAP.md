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
- [x] Inventory system (30-slot grid, drag-and-drop, categories)
- [x] Tool system (8 tools, 3 tiers, durability, item defs)
- [x] Save/Load with 3 slots + auto-save
- [x] Main menu (New Game, Continue, Settings, Credits)
- [x] Settings panel (graphics quality, audio sliders, controls)
- [x] Pause menu (Resume, Save, Load, Quit)
- [x] Audio manager (procedural SFX, ambient, volume controls)
- [ ] Zone loading system (hub + 6 zones, fade transitions)
- [x] Resource gathering (trees, rocks, bushes, ore, clay, flax)
- [x] Item pickup and interaction prompt

## Phase 3: Combat (14 tasks)

- [x] Lock-on targeting (tap enemy, strafe movement)
- [x] Light attack combo system (3-hit, timing window)
- [x] Heavy attack (slow, high damage, guard break)
- [x] Shield block + perfect block
- [x] Dodge roll with invincibility frames
- [x] Stagger system + knockback
- [x] Hitstop and camera shake on impact
- [x] Enemy telegraphs (red ring before attack)
- [x] Enemy AI: Bandit (patrol, chase, block, retreat)
- [x] Enemy AI: Wolf (fast, pack-hunt, pounce)
- [x] Enemy AI: Boar (charge attack, high damage)
- [x] Weapon tiers (wood→iron→steel) with damage scaling
- [x] Armor system (leather→chain→plate)
- [x] Bow combat (draw, aim, release, arrow physics)

## Phase 4: World Zones (14 tasks)

- [x] Village Hub — player hut, NPC plots, well, square, zone gate
- [x] Forest — dense trees, berries, wolves, deer, rabbits
- [x] Riverlands — animated river, fishing spots, clay deposits
- [x] Farmlands — open fields, windmill, hay bales, wild wheat
- [x] Iron Mine — cave system, ore veins, bats, spiders
- [x] Bandit Camp — tents, campfires, bandit spawns, loot chest
- [x] Old Ruins — stone walls, puzzle gate, boss room
- [x] Zone transition system (gate triggers, fade loading)
- [x] Wildlife spawn system (per-zone animal spawning)
- [x] Resource node respawning (timed respawn per zone)
- [ ] Zone-specific ambient audio
- [x] Enemy spawns per zone (bandits, wolves, spiders, skeletons)
- [ ] Loot containers (chests, barrels, hidden caches)
- [ ] Zone mini-map (top-down terrain render)

## Phase 5: Farming & Crafting (12 tasks)

- [x] Farming system — plow (hoe on grass → farm plot)
- [x] 6 crops (wheat, barley, cabbage, carrot, flax, onion)
- [x] Growth stages (5 stages, real-time progression)
- [x] Watering (bucket at river → pour on plot)
- [x] Seasonal farming (crop planting seasons, fallow fields)
- [x] Fertilizer (manure, compost, soil quality)
- [x] Cooking — campfire (roast, soup, bread, stew)
- [x] Hearth cooking (pies, seasoned meals, stat bonuses)
- [x] Crafting stations (workbench, anvil, sawmill, loom, kiln, still)
- [x] Tool repair and upgrade (anvil, material cost)
- [x] Recipe system (unlock via skill levels)
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

**Last updated:** Session 5

**Phase 1:** 15/15 tasks completed
**Phase 2:** 9/12 tasks completed
**Phase 3:** 14/14 tasks completed
**Phase 4:** 12/14 tasks completed
**Phase 5:** 11/12 tasks completed
**Phase 6:** 0/10 tasks completed
**Phase 7:** 0/12 tasks completed

**Total:** 61/89 tasks completed
