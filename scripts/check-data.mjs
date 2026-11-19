// Every modelled part must have data, every data entry a part, and every link a valid, unique target.
import { PARTS, SYSTEMS } from '../src/parts-data.js';
import { NUMBERS, NONE } from '../src/parts-numbers.js';
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
// part numbers: well-formed, for parts that exist, and not both "has a number" and "has none"
const PN = /^([0-9][0-9A-Z]{2} \d{3} \d{3}( [A-Z]{1,3})?|WHT \d{3} \d{3}( [A-Z])?|N \d{3} \d{3} \d{2})$/;      // VW number, WHT or N standard part
for (const [id, rows] of Object.entries(NUMBERS)) {
  if (!PARTS[id]) bad.push(`number for unknown part: ${id}`);
  if (NONE[id]) bad.push(`${id} has numbers and is listed as having none`);
  for (const r of rows) {
    for (const n of [r.n, ...(r.alt || [])]) if (!PN.test(n)) bad.push(`${id}: odd part number "${n}"`);
    if (!r.what || !(r.qty > 0)) bad.push(`${id}: ${r.n} needs a description and a quantity`);
    if (r.src === 'etka' && !/^\d{3}-\d{3}$/.test(r.etka || '')) bad.push(`${id}: ${r.n} needs its ETKA illustration`);
  }
}
for (const id of Object.keys(NONE)) if (!PARTS[id]) bad.push(`"no number" for unknown part: ${id}`);
const open = Object.keys(PARTS).filter((id) => !PARTS[id].pn && !PARTS[id].noPn);
console.log(`${ids.length} parts`, bad.length ? bad.join(', ') : 'all data and links ok');
console.log(`part numbers: ${Object.keys(NUMBERS).length} parts with a number, ${Object.keys(NONE).length} with none of their own, ${open.length} still to be looked up`);
if (process.argv.includes('--open')) console.log(open.join(' '));
process.exit(bad.length ? 1 : 0);
