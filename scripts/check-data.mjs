// Every modelled part must have data, every data entry a part, and every link a valid, unique target.
import { PARTS, SYSTEMS } from '../src/parts-data.js';
import { buildEngine } from '../src/engine.js';

const e = buildEngine();
const ids = Object.keys(e.parts);
const bad = [];
for (const id of ids) if (!PARTS[id]) bad.push(`no data: ${id}`);
for (const [id, p] of Object.entries(PARTS)) {
  if (!e.parts[id]) bad.push(`no part: ${id}`);
  if (!SYSTEMS[p.sys]) bad.push(`unknown system: ${id}`);
  const seen = new Set();
  for (const [t] of p.links) {
    if (!PARTS[t]) bad.push(`${id} -> ${t}`);
    if (seen.has(t)) bad.push(`duplicate ${id} -> ${t}`);
    seen.add(t);
  }
}
console.log(`${ids.length} parts`, bad.length ? bad.join(', ') : 'all data and links ok');
process.exit(bad.length ? 1 : 0);
