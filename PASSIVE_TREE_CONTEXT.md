# Passive Tree Viewer - Development Context

This document contains technical context for continuing development of the passive tree viewer.

## Overview

Built a **canvas-based passive tree viewer** for Path of Exile that renders the skill tree using GGG's texture atlases and tree data.

## Key Files

- `src/pages/passive-tree.astro` - Main viewer component (canvas rendering, pan/zoom, all rendering logic)
- `public/data/tree.json` - GGG's tree structure data (nodes, groups, sprites, coordinates)
- `public/data/assets/` - Texture atlases from GGG
- `public/data/assets/backgrounds/` - Individual background images extracted from TreeData

## Assets Source

Individual assets extracted from: `src/PathOfBuilding-dev/src/TreeData/`

Key assets used:
- `PSGroupBackground1.png` - Small node group wheel (138x138 full circle)
- `PSGroupBackground2.png` - Medium node group wheel (178x178 full circle)
- `PSGroupBackground3.png` - Large wheel (283x143 **semicircle** - must be mirrored!)
- `GroupBackgroundSmallAlt.png`, `GroupBackgroundMediumAlt.png`, `GroupBackgroundLargeHalfAlt.png` - Alternative versions

## Critical Implementation Details

### 1. PSGroupBackground3 is a SEMICIRCLE

The large wheel background (`PSGroupBackground3`) is a semicircle that must be drawn twice and mirrored to create a full wheel:

```javascript
if (bgName === 'PSGroupBackground3') {
  // Draw top half (normal)
  ctx.drawImage(bgImage, -w / 2, -h, w, h);
  // Draw bottom half (flipped vertically, positioned below)
  ctx.save();
  ctx.scale(1, -1);
  ctx.drawImage(bgImage, -w / 2, -h, w, h);
  ctx.restore();
}
```

### 2. Group Classification (Pre-computed for Performance)

Groups are classified during `processNodes()` into Sets for O(1) lookups:

```javascript
let masteryGroups = new Set();      // Groups containing mastery nodes
let ascendancyGroups = new Set();   // Groups belonging to ascendancy trees
```

This fixed extreme lag - previously each render frame iterated all nodes for each group.

### 3. Ascendancy Offsets

Some ascendancies overlap and need position offsets:

```javascript
const ASCENDANCY_OFFSETS = {
  'Inquisitor': { x: 0, y: 350 },   // Move down (away from Hierophant)
  'Juggernaut': { x: 0, y: 350 },   // Move down (away from Berserker)
};
```

Offsets are applied in `processNodes()` to both node positions and backgrounds.

### 4. Background Selection Logic

- **Masteries**: Use their specified background with larger scale (3.0-3.2)
- **Ascendancy groups**: Skip in `renderGroupBackgrounds()`, handled by `renderAscendancyBackgrounds()`
- **Regular groups**: Use background specified in `group.background.image` from tree.json

### 5. Sprite Atlases

The viewer uses both:
- **Sprite sheets** (e.g., `skills-3.jpg`, `frame-3.png`) with coordinates from `tree.json.sprites`
- **Individual images** for group backgrounds (simpler, avoids coordinate lookup issues)

## Rendering Layers (Back to Front)

1. `renderBackground()` - Tiled background pattern
2. `renderAscendancyBackgrounds()` - Ascendancy class backgrounds (from `ascendancy-3.webp`)
3. `renderGroupBackgrounds()` - Node group wheel decorations
4. `renderClassStartBackgrounds()` - Class starting area decorations
5. `renderConnections()` - Lines between nodes
6. `renderNodes()` - Node icons and frames

## Tree Data Structure

From `tree.json`:
- `nodes` - All passive nodes with properties (icon, type, connections, group, orbit, orbitIndex)
- `groups` - Node clusters with x/y position and background info
- `sprites` - Sprite sheet coordinates for each zoom level (use `0.3835` for highest quality)
- `constants.orbitRadii` - Radius for each orbit level
- `constants.skillsPerOrbit` - Number of skill positions per orbit

## Node Position Calculation

```javascript
const radius = orbitRadii[node.orbit];
const angle = (2 * Math.PI * node.orbitIndex) / skillsPerOrbit[node.orbit];
const x = group.x + radius * Math.sin(angle);
const y = group.y - radius * Math.cos(angle);
```

## Reference Resources

- GGG's official tree export: https://github.com/grindinggear/skilltree-export
- Maxroll's implementation: https://maxroll.gg/poe/poe-passive-tree/
- Path of Building source: `src/PathOfBuilding-dev/src/Classes/PassiveTreeView.lua`

## PoB's DrawAsset Function (Reference)

```lua
function PassiveTreeViewClass:DrawAsset(data, x, y, scale, isHalf)
  local width = data.width * scale * 1.33
  local height = data.height * scale * 1.33
  if isHalf then
    DrawImage(data.handle, x - width, y - height * 2, width * 2, height * 2)
    DrawImage(data.handle, x - width, y, width * 2, height * 2, 0, 1, 1, 0)
  else
    DrawImage(data.handle, x - width, y - height, width * 2, height * 2, unpack(data))
  end
end
```

## Future Work

- [ ] Orbit connection lines using `OrbitXActive.png` / `OrbitXNormal.png` from TreeData
- [ ] Node allocation state (active vs inactive icons)
- [ ] Mastery effect selection
- [ ] Search/filter nodes
- [ ] Build import/export

## Notes

- Avoid using `CanAllocate` or `Intermediate` assets - those are for selection states
- Use `Active` for allocated nodes, `Normal` for unallocated
- The `isHalfImage` flag in tree.json indicates the asset needs mirroring
