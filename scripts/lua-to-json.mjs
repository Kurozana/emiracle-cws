/**
 * Converts PoB's tree.lua and sprites.lua to JSON files.
 * Run once: node scripts/lua-to-json.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TREE_DATA = join(ROOT, 'src', 'PathOfBuilding-dev', 'src', 'TreeData', '3_27');
const OUT_DIR = join(ROOT, 'public', 'data');

/**
 * Simple Lua table parser.
 * Handles the subset of Lua used by PoB's data files:
 * - Tables with string keys ["key"]= value
 * - Tables with numeric keys [123]= value
 * - Array tables {value1, value2, ...}
 * - String values "..."
 * - Number values
 * - Boolean values (true/false)
 */
function parseLua(src) {
  let pos = 0;

  function skipWhitespace() {
    while (pos < src.length) {
      // Skip whitespace
      if (/\s/.test(src[pos])) { pos++; continue; }
      // Skip single-line comments
      if (src[pos] === '-' && src[pos + 1] === '-') {
        while (pos < src.length && src[pos] !== '\n') pos++;
        continue;
      }
      break;
    }
  }

  function parseString() {
    if (src[pos] !== '"') throw new Error(`Expected " at ${pos}, got ${src[pos]}`);
    pos++; // skip opening "
    let str = '';
    while (pos < src.length && src[pos] !== '"') {
      if (src[pos] === '\\') {
        pos++;
        if (src[pos] === 'n') str += '\n';
        else if (src[pos] === 't') str += '\t';
        else if (src[pos] === '\\') str += '\\';
        else if (src[pos] === '"') str += '"';
        else str += src[pos];
      } else {
        str += src[pos];
      }
      pos++;
    }
    pos++; // skip closing "
    return str;
  }

  function parseNumber() {
    let start = pos;
    if (src[pos] === '-') pos++;
    while (pos < src.length && /[0-9.]/.test(src[pos])) pos++;
    return parseFloat(src.substring(start, pos));
  }

  function parseValue() {
    skipWhitespace();
    if (pos >= src.length) return null;

    const ch = src[pos];

    // String
    if (ch === '"') return parseString();

    // Table
    if (ch === '{') return parseTable();

    // Boolean
    if (src.substring(pos, pos + 4) === 'true') { pos += 4; return true; }
    if (src.substring(pos, pos + 5) === 'false') { pos += 5; return false; }

    // Number (including negative)
    if (ch === '-' || (ch >= '0' && ch <= '9')) return parseNumber();

    throw new Error(`Unexpected char '${ch}' at pos ${pos}: ...${src.substring(pos, pos + 20)}...`);
  }

  function parseTable() {
    if (src[pos] !== '{') throw new Error(`Expected { at ${pos}`);
    pos++; // skip {

    skipWhitespace();

    // Empty table - default to array since most empty tables in PoB are arrays (out, in, stats, etc.)
    if (src[pos] === '}') { pos++; return []; }

    // Peek to determine if this is an array or object
    // Array: first element is a value (string, number, table, bool)
    // Object: first element starts with [
    const isObject = src[pos] === '[';

    if (isObject) {
      const obj = {};
      while (pos < src.length) {
        skipWhitespace();
        if (src[pos] === '}') { pos++; return obj; }

        // Skip comma
        if (src[pos] === ',') { pos++; continue; }

        // Parse key: ["string"]= or [number]=
        if (src[pos] !== '[') throw new Error(`Expected [ at ${pos}, got ${src[pos]}`);
        pos++; // skip [

        let key;
        if (src[pos] === '"') {
          key = parseString();
        } else {
          key = parseNumber();
        }

        if (src[pos] !== ']') throw new Error(`Expected ] at ${pos}`);
        pos++; // skip ]

        skipWhitespace();
        if (src[pos] !== '=') throw new Error(`Expected = at ${pos}`);
        pos++; // skip =

        skipWhitespace();
        const value = parseValue();
        obj[key] = value;

        skipWhitespace();
        if (src[pos] === ',') pos++; // optional trailing comma
      }
      return obj;
    } else {
      // Array
      const arr = [];
      while (pos < src.length) {
        skipWhitespace();
        if (src[pos] === '}') { pos++; return arr; }
        if (src[pos] === ',') { pos++; continue; }
        arr.push(parseValue());
        skipWhitespace();
        if (src[pos] === ',') pos++; // optional trailing comma
      }
      return arr;
    }
  }

  // The file starts with "return { ... }"
  // Skip the "return" keyword
  skipWhitespace();
  if (src.substring(pos, pos + 6) === 'return') {
    pos += 6;
  }
  skipWhitespace();
  return parseValue();
}

// Convert tree.lua
console.log('Parsing tree.lua...');
const treeSrc = readFileSync(join(TREE_DATA, 'tree.lua'), 'utf-8');
const treeData = parseLua(treeSrc);
console.log(`  nodes: ${Object.keys(treeData.nodes || {}).length}`);
console.log(`  groups: ${Object.keys(treeData.groups || {}).length}`);

const treeOutPath = join(OUT_DIR, 'pob-tree.json');
writeFileSync(treeOutPath, JSON.stringify(treeData, null, 2));
console.log(`  Written to ${treeOutPath}`);

// Convert sprites.lua
console.log('Parsing sprites.lua...');
const spritesSrc = readFileSync(join(TREE_DATA, 'sprites.lua'), 'utf-8');
const spritesData = parseLua(spritesSrc);
const spriteCategories = Object.keys(spritesData.sprites || {});
console.log(`  sprite categories: ${spriteCategories.length} (${spriteCategories.join(', ')})`);

const spritesOutPath = join(OUT_DIR, 'pob-sprites.json');
writeFileSync(spritesOutPath, JSON.stringify(spritesData, null, 2));
console.log(`  Written to ${spritesOutPath}`);

console.log('Done!');
