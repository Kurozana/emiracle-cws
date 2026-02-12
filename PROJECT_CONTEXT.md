# Emiracle CWS - Project Context & Instructions

## Overview
Astro-based Path of Exile 1 build guide site. Deployed as a static site.
Two loadouts: "Cast When Stunned" (Chieftain) and "CWS: Gladiator".

---

## User Preferences & Rules

### Git
- **Never include Co-Authored-By** in commit messages
- If creating a `git commit` do not add yourself as a co-author.
- Never auto-commit without being asked
- Never push without being asked
- Keep commit messages concise and descriptive

### Code Style
- Keep solutions simple, avoid over-engineering
- Don't add unnecessary comments/docstrings to unchanged code
- Prefer editing existing files over creating new ones

### Navigation
- User manages nav items in `src/components/Navigation.astro`
- Don't add nav links without asking

---

## Project Structure

### Pages
- `src/pages/index.astro` - Home
- `src/pages/guide.astro` - Build guide
- `src/pages/builds.astro` - Builds page (gear grid, skill setups, etc.)
- `src/pages/crafting.astro` - Crafting guide
- `src/pages/leveling.astro` - Leveling guide
- `src/pages/faq.astro` - FAQ
- `src/pages/passive-tree-v2.astro` - Public passive tree viewer (V2)
- `src/pages/admin/tree-editor.astro` - Admin-only tree node allocator (hidden)

### Key Data Files
- `src/data/skills.json` - Loadout/progression data (skill setups, gear, tree data)
  - Loadouts: `skills.json → loadouts.[id].progressions.[id]`
  - Tree data: `loadouts.[id].progressions.[id].passiveTree.treeData` (JSON string)
  - treeData format: `{"class":"Chieftain","nodes":["47175","50904"],"masteries":{"12345":60050}}`
- `public/data/pob-tree.json` - PoB tree data (node positions, connections, classes)
- `public/data/pob-sprites.json` - Sprite atlas coordinates for tree rendering
- `public/data/tree.json` - Old GGG tree data (V1, no longer used)
- `public/data/assets/` - Sprite atlas PNGs, class backgrounds, etc.

### Components
- `src/components/Navigation.astro` - Site navigation
- `src/components/PoeTooltip.astro` - PoE-style tooltip component
- `src/layouts/BaseLayout.astro` - Base page layout

### Other Important Dirs
- `src/PathOfBuilding-dev/src/Assets/` - PoB source assets (mastery headers, etc.)
- `public/Gear/` - Gear tooltip header images (ItemsHeaderNormalLeft.webp, etc.)

---

## Passive Tree V2 Viewer (`passive-tree-v2.astro`)

### Architecture
- Canvas-based rendering with sprite atlases from `pob-sprites.json`
- Uses `pob-tree.json` + `pob-sprites.json`, NOT `tree.json`
- Arc segment connections (not full orbit rings)
- Pan/zoom via pointer events + wheel

### Sprite Categories (from pob-sprites.json)
- `normalActive/normalInactive` - Small passives (key: `node.icon`)
- `notableActive/notableInactive` - Notable passives (key: `node.icon`)
- `keystoneActive/keystoneInactive` - Keystone passives (key: `node.icon`)
- `mastery` - Mastery base icons (key: `node.icon`, e.g. `AltAreaDamageMastery.png`)
- `masteryConnected` - Inactive mastery icons (key: `node.inactiveIcon`)
- `masteryActiveSelected` - Active mastery icons (key: `node.activeIcon`)
- `masteryActiveEffect` - Mastery effect background patterns (key: `node.activeEffectImage`)
- `masteryInactive` - Disabled mastery icons (same keys as masteryConnected)
- `frame` - Node frames (PSSkillFrameActive, NotableFrameAllocated, etc.)
- `line` - Connection line sprites (LineConnectorActive, LineConnectorNormal)
- `ascendancy` - Ascendancy frames
- `background` - Background tile

### Rendering Pipeline (in order)
1. `renderClassBackground()` - Class background image at class start position
2. `renderBackground()` - Tile background
3. `renderGroupBackgrounds()` - Group backgrounds (PSGroupBackground1/2/3)
4. `renderConnections()` - Lines between nodes (arc segments)
5. `renderMasteryEffects()` - Mastery active effect backgrounds (rendered BEFORE nodes so they don't cover neighbors)
6. `renderNodes()` - Node icons + frames
7. `renderHoverPreview()` - Green/red hover previews (editor only)

### Known Gotchas
- classStartIndex nodes must be skipped in renderConnections()
- PSGroupBackground3 is a semicircle (must mirror vertically)
- Class start backgrounds: individual PNGs at scale 2.6
- V1 has been deleted. Only V2 exists now.

---

## Tree Editor (`src/pages/admin/tree-editor.astro`)

### Access
- Route: `/admin/tree-editor/` (not in navigation)
- SHA-256 password gate with localStorage caching

### Features (Implemented)
- Canvas-based tree rendering (same pipeline as V2 viewer)
- Class/ascendancy selection dropdowns
- BFS auto-pathing: click any node and it automatically finds shortest path from allocated tree
- Cascade deallocation: removing a node also removes nodes that become disconnected from class start
- Hover previews: green circles/lines for allocation path, red circles/lines for cascade deallocation
- Mastery support: click mastery → popup with effect choices → auto-path + allocate on selection
- Class background: renders behind tree at class starting area, full opacity
- Save/load treeData JSON (clipboard + download)
- Point counters: Main X/123, Ascendancy X/8
- Stat/tooltip on hover: shows node name (white) in header + stats (#8888ff) below
- Header assets per node type: left/middle/right images (same pattern as gear grid)
- Mastery click popup: same styling as hover tooltip, with effect choices + NotableFrame bullet

### Key Technical Details
- Uses Astro `define:vars` to inject `skills.json` at build time (src/data/ not public)
- **MUST use `<style is:global>`** — Astro scoped styles don't match dynamically-created elements (innerHTML, createElement). This was the root cause of all tooltip/popup styling failures.
- Mastery nodes are NOT in the adjacency graph (tracked separately in `allocatedMasteries` Map)
- `findPathToMastery()` finds shortest path to any of a mastery's connected nodes
- Pending mastery path pattern: compute path on click, allocate only when effect is chosen
- Pointer capture (`setPointerCapture`) must skip popup elements to avoid blocking button clicks

### Tooltip/Popup System
- Both hover tooltip and click popup share identical styling (`.te-node-tooltip`, `.te-mastery-popup`)
- Header uses `<img>` tags (left/right) + `<div>` with `background-image` (middle), set via JS
- `setHeaderImages(prefix, leftId, midId, rightId)` helper sets correct assets per node type
- `getNodeHeaderType(node)` returns: normal, notable, keystone, mastery, or jewel
- Header asset map:
  - normal → `normalpassiveheaderleft/middle/right.png`
  - notable → `notablepassiveheaderleft/middle/right.png`
  - keystone → `keystonepassiveheaderleft/middle/right.png`
  - mastery → `masteryheaderallocatedleft/middle/right.png`
  - jewel → `jewelpassiveheaderleft/middle/right.png`
- Font: system sans-serif (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`)
- Name color: `#ffffff` (white), Stat color: `#8888ff` (blue)
- Background: `rgba(0, 0, 0, 0.95)`
- Mastery effect bullet: `NotableFrameUnallocated.png` at 18px

### Mastery Active Effect (Canvas)
- When a mastery effect is selected, renders: effect background (3x icon size) + active icon on top
- Effect sprites from `masteryActiveEffect` atlas (`mastery-active-effect-3.png`)
- Icon sprites from `masteryActiveSelected` atlas
- Effect keys match between `pob-tree.json` (node.activeEffectImage) and `pob-sprites.json` coords

### Features (Planned/In Progress)
- None currently

---

## Gear Grid System (in `builds.astro`)

### Tooltip Styling (for reference when building tree tooltips)
- Background: `rgba(0, 0, 0, 0.95)`
- Border: `1px solid #444`
- Border radius: `4px`
- Box shadow: `0 4px 20px rgba(0, 0, 0, 0.8)`
- Stat text color: `#8888ff` (blue)
- Separator lines: `1px solid #333`
- Font: `'Fontin', 'Fontin-Regular', Georgia, serif` (from PoeTooltip component)
- Item name: `1rem`, weight `600`
- Stat text: `0.85rem`, line-height `1.4`
- Rarity colors: Normal `#c8c8c8`, Magic `#8888ff`, Rare `#ffff77`, Unique `#af6025`

### Header Assets (left/middle/right pattern)
- Located in `public/Gear/ItemsHeader{Rarity}{Side}.webp`
- Example: `ItemsHeaderUniqueLeft.webp`, `ItemsHeaderRareMiddle.webp`

---

## Bugs Fixed (Knowledge Base)

### Temporal Dead Zone
- Problem: `editorInitialized` accessed before declaration when `unlock()` called from localStorage check at top of IIFE
- Fix: Move auth init to bottom of IIFE

### Skills.json Not Accessible at Runtime
- Problem: `src/data/` is not in public directory, can't fetch at runtime
- Fix: Use Astro `define:vars` to inject data at build time

### Mastery Auto-Pathing
- Problem: Couldn't click a mastery unless adjacent notable was already allocated
- Fix: Added `findPathToMastery()` that finds shortest path to any connected node, with pending path pattern (allocate on effect selection)

### Pointer Capture Blocking Popup Clicks
- Problem: `setPointerCapture` in viewer's pointerdown handler captured all pointer events even when clicking popup buttons, preventing button click events from firing
- Fix: Skip `setPointerCapture` when event target is inside the mastery popup

### Class Background Position
- Problem: Initially centered at (0,0) which is Scion's area
- Fix: Position at the class start group's (x, y) coordinates

---

## Asset Sources

### Mastery Header Assets (for allocated mastery display)
- `src/PathOfBuilding-dev/src/Assets/masteryheaderallocatedleft.png`
- `src/PathOfBuilding-dev/src/Assets/masteryheaderallocatedmiddle.png`
- `src/PathOfBuilding-dev/src/Assets/masteryheaderallocatedright.png`
- `src/PathOfBuilding-dev/src/Assets/masteryheaderunallocatedleft.png`
- `src/PathOfBuilding-dev/src/Assets/masteryheaderunallocatedmiddle.png`
- `src/PathOfBuilding-dev/src/Assets/masteryheaderunallocatedright.png`

### Class Backgrounds
- `public/data/assets/BackgroundStr.png` (Marauder)
- `public/data/assets/BackgroundDex.png` (Ranger)
- `public/data/assets/BackgroundInt.png` (Witch)
- `public/data/assets/BackgroundStrDex.png` (Duelist)
- `public/data/assets/BackgroundStrInt.png` (Templar)
- `public/data/assets/BackgroundDexInt.png` (Shadow)

### Sprite Atlas PNGs
All in `public/data/assets/` - named after CDN URLs (e.g., `mastery-active-selected-3.png`)

---

## Technical Reference

### PSGroupBackground3 Semicircle Mirroring
The large wheel background is a semicircle that must be drawn twice (mirrored vertically):
```javascript
if (bgName === 'PSGroupBackground3') {
  ctx.drawImage(bgImage, -w / 2, -h, w, h);       // Top half
  ctx.save();
  ctx.scale(1, -1);
  ctx.drawImage(bgImage, -w / 2, -h, w, h);       // Bottom half (flipped)
  ctx.restore();
}
```

### Node Position Calculation
```javascript
const radius = orbitRadii[node.orbit];
const angle = (2 * Math.PI * node.orbitIndex) / skillsPerOrbit[node.orbit];
const x = group.x + radius * Math.sin(angle);
const y = group.y - radius * Math.cos(angle);
```

### Group Classification
Groups are pre-classified into Sets during `processNodes()` for O(1) lookups:
- `masteryGroups` - Groups containing mastery nodes
- `ascendancyGroups` - Groups belonging to ascendancy trees
- `lineOnlyGroups` - Groups with no background (connection lines only)

### External References
- GGG's official tree export: https://github.com/grindinggear/skilltree-export
- Path of Building source: `src/PathOfBuilding-dev/src/Classes/PassiveTreeView.lua`
