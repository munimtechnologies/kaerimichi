// test_gtfs.mjs - checks gtfs.js on a tiny made-up network.
// Run through test_kaerimichi.py (it copies this next to gtfs.js with {"type": "module"}).
// MV2 of Munim, Inc. - MIT license.
import assert from 'node:assert/strict';
import { buildModel, dayView, journeys, serviceGaps } from './gtfs.js';

// H is the hospital. Every trip runs on weekdays only.
const TRIPS = {
  T1: [['A', '8:00'], ['B', '8:10'], ['H', '8:30']],   // A and B: direct to H
  T2: [['H', '12:00'], ['B', '12:20'], ['A', '12:30']], // and direct back
  T3: [['C', '7:00'], ['B', '7:20']],                   // C: only by changing at B
  T4: [['B', '13:00'], ['C', '13:20']],
  T5: [['D', '9:00'], ['H', '9:30']],                   // D: no bus back at all
  T6: [['E', '6:00'], ['F', '6:30']],                   // E: never reaches H; F: no departures
  T7: [['G', '17:00'], ['H', '17:30']],                 // G: the last bus back leaves before you arrive
  T8: [['H', '16:00'], ['G', '16:30']],
};
const NAMES = { A: 'Aoba', B: 'Bashi', H: 'Hospital', C: 'Chuo', D: 'Daimon', E: 'Eki', F: 'Fuchi', G: 'Gakko' };

let stops = 'stop_id,stop_name,stop_lat,stop_lon\n';
Object.keys(NAMES).forEach((id, k) => { stops += `${id},${NAMES[id]},${36 + k * 0.01},${140 + k * 0.01}\n`; });
let trips = 'route_id,service_id,trip_id\n';
let times = 'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n';
for (const [id, calls] of Object.entries(TRIPS)) {
  trips += `R,WK,${id}\n`;
  calls.forEach(([stop, hm], k) => { times += `${id},${hm}:00,${hm}:00,${stop},${k + 1}\n`; });
}
const text = {
  'stops.txt': stops,
  'routes.txt': 'route_id,route_short_name\nR,1\n',
  'trips.txt': trips,
  'stop_times.txt': times,
  'calendar.txt': 'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nWK,1,1,1,1,1,0,0,20260101,20271231\n',
};
const enc = new TextEncoder();
const model = buildModel(new Map(Object.entries(text).map(([name, s]) => [name, enc.encode(s)])));
const at = key => model.places.findIndex(p => p.key === key);
const hm = (h, m) => h * 3600 + m * 60;

assert.equal(model.places.length, 8);
assert.equal(model.served[at('F')], 1);

const view = dayView(model, '20261014'); // a Wednesday
assert.equal(view.trips.length, 8);
assert.equal(dayView(model, '20261018').trips.length, 0); // a Sunday
assert.equal(view.stat[at('F')].n, 0);

// Pair search: C -> H needs one change at B.
assert.equal(journeys(view, at('C'), at('H'), 0).length, 0);
const cToH = journeys(view, at('C'), at('H'), 1, 300);
assert.equal(cToH.length, 1);
assert.equal(cToH[0].via, at('B'));
assert.equal(cToH[0].arr, hm(8, 30));

// Service-gap map against H, 30 minutes minimum stay.
const statusOf = gaps => Object.fromEntries(model.places.map((p, i) => [p.key, gaps[i].status]));
const gaps = serviceGaps(view, at('H'), 1, 300, 30 * 60);
assert.deepEqual(statusOf(gaps), { A: 'ok', B: 'ok', H: 'hub', C: 'okx', D: 'oneway', E: 'none', F: 'idle', G: 'noreturn' });
assert.equal(gaps[at('A')].rt.firstArr, hm(8, 30));
assert.equal(gaps[at('A')].rt.lastBack, hm(12, 0));
assert.equal(gaps[at('C')].rt.lastBack, hm(12, 0));
assert.equal(gaps[at('C')].rt.maxStay, hm(3, 30));

// Without transfers C can't get there; with a 4-hour stay A can't get back in time.
assert.equal(serviceGaps(view, at('H'), 0, 300, 30 * 60)[at('C')].status, 'none');
assert.equal(serviceGaps(view, at('H'), 1, 300, 4 * 3600)[at('A')].status, 'noreturn');

console.log('gtfs.js ok');
