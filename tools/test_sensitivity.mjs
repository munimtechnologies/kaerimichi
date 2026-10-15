// test_sensitivity.mjs - checks hospital_names.mjs and the sensitivity rows on a tiny made-up feed zipped in memory.
// Run: node tools/test_sensitivity.mjs (uses the app's ../gtfs.js).
// MV2 of Munim, Inc. - Apache-2.0 license.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { analyseFeed, toCsv, NOT_HOSPITAL } from './lib.mjs';
import { hospitalSensitivity } from './hospital_names.mjs';
import { hospitalStopRows, changedRow, summarise, HOSPITAL_STOP_COLUMNS, CHANGED_COLUMNS } from './hospital_sensitivity.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// gtfs.js is an ES module without a package.json beside it, so load a .mjs copy.
const copy = join(tmpdir(), 'kaerimichi-gtfs-sens-test.mjs');
writeFileSync(copy, readFileSync(join(HERE, '..', 'gtfs.js'), 'utf8'));
const g = await import(pathToFileURL(copy).href);

// A stored (uncompressed) zip: enough for gtfs.js's reader, which skips CRC checks.
function zip(files) {
  const enc = new TextEncoder();
  const parts = [], central = [];
  let offset = 0;
  for (const [name, text] of Object.entries(files)) {
    const n = enc.encode(name), d = enc.encode(text);
    const local = new Uint8Array(30 + n.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true);
    lv.setUint32(18, d.length, true); lv.setUint32(22, d.length, true); lv.setUint16(26, n.length, true);
    local.set(n, 30);
    const cd = new Uint8Array(46 + n.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint32(20, d.length, true); cv.setUint32(24, d.length, true); cv.setUint16(28, n.length, true);
    cv.setUint32(42, offset, true);
    cd.set(n, 46);
    parts.push(local, d);
    central.push(cd);
    offset += local.length + d.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, central.length, true); ev.setUint16(10, central.length, true);
  ev.setUint32(12, size, true); ev.setUint32(16, offset, true);
  const all = new Uint8Array(offset + size + 22);
  let p = 0;
  for (const x of [...parts, ...central, end]) { all.set(x, p); p += x.length; }
  return all.buffer;
}

// Z (a dentist) is the busiest hospital-named stop, H (中央病院) the real hospital.
// A: there and back to both; B: there and back to Z only; Saturday: only T1 runs, so no way back.
const STOPS = { Z: 'さくら歯科医院', H: '中央病院', A: 'Aoba', B: 'Bashi' };
const TRIPS = {
  T1: ['ALL', [['A', '8:00'], ['Z', '8:10'], ['H', '8:30']]],
  T2: ['WK', [['Z', '9:00'], ['A', '9:20']]],
  T3: ['WK', [['Z', '10:00'], ['B', '10:20']]],
  T4: ['WK', [['H', '12:00'], ['A', '12:30']]],
  T5: ['WK', [['B', '7:00'], ['Z', '7:20']]],
};
function feed(names) {
  let stops = 'stop_id,stop_name,stop_lat,stop_lon\n';
  Object.entries(names).forEach(([id, name], k) => { stops += `${id},${name},${36 + k * 0.01},${140 + k * 0.01}\n`; });
  let trips = 'route_id,service_id,trip_id\n';
  let times = 'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n';
  for (const [id, [service, calls]] of Object.entries(TRIPS)) {
    trips += `R,${service},${id}\n`;
    calls.forEach(([stop, hm], k) => { times += `${id},${hm}:00,${hm}:00,${stop},${k + 1}\n`; });
  }
  return zip({
    'agency.txt': 'agency_id,agency_name,agency_url,agency_timezone\nX,Test Bus,https://example.org/,Asia/Tokyo\n',
    'stops.txt': stops,
    'routes.txt': 'route_id,route_short_name,route_type\nR,1,3\n',
    'trips.txt': trips,
    'stop_times.txt': times,
    'calendar.txt': 'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\n'
      + 'WK,1,1,1,1,1,0,0,20260101,20271231\nALL,1,1,1,1,1,1,0,20260101,20271231\n',
  });
}

const dates = { date: '2026-10-21', sat: '2026-10-24' };

// The pattern: dentists and vets, not place names that merely contain 歯 or 動物.
assert.ok(NOT_HOSPITAL.test('さくら歯科医院') && NOT_HOSPITAL.test('森の動物病院') && NOT_HOSPITAL.test('獣医科前'));
assert.ok(!NOT_HOSPITAL.test('歯舞診療所前') && !NOT_HOSPITAL.test('動物園前') && !NOT_HOSPITAL.test('中央病院'));

// lib.mjs: without `exclude` the dentist is the first hub (the app's behaviour); with it, only 中央病院.
const app = await analyseFeed(g, feed(STOPS), dates);
assert.deepEqual(app.hubs.map(h => h.name), ['さくら歯科医院', '中央病院']);
assert.equal(app.base, 2);
assert.equal(app.roundTrip, 2);
const strict = await analyseFeed(g, feed(STOPS), { ...dates, exclude: NOT_HOSPITAL });
assert.deepEqual(strict.hubs.map(h => h.name), ['中央病院']);
const st = Object.fromEntries(strict.stops.map(s => [s.key, s.status]));
assert.equal(st.H, 'hub');
assert.equal(st.A, 'ok');
assert.ok(!['ok', 'okx'].includes(st.B), st.B);
assert.ok(!['ok', 'okx'].includes(st.Z), st.Z);
assert.equal(strict.base, 3); // A, B and now Z
assert.equal(strict.roundTrip, 1);
assert.equal(strict.share, 0.333);
assert.equal(strict.roundTripSat, 0);

// hospital_names.mjs: every hospital-named stop with its service, and both sets of counts.
const r = await hospitalSensitivity(g, feed(STOPS), dates);
assert.equal(r.same, false);
assert.deepEqual(r.hubsApp, ['さくら歯科医院', '中央病院']);
assert.deepEqual(r.hubsStrict, ['中央病院']);
assert.deepEqual(r.app, { base: 2, roundTrip: 2, roundTripSat: 0, share: 1, shareSat: 0 });
assert.deepEqual(r.strict, { base: 3, roundTrip: 1, roundTripSat: 0, share: 0.333, shareSat: 0 });
const by = Object.fromEntries(r.stops.map(s => [s.key, s]));
assert.deepEqual(Object.keys(by).sort(), ['H', 'Z']);
assert.equal(by.Z.callsWed, 4);
assert.equal(by.Z.departuresWed, 3);
assert.equal(by.Z.callsSat, 1);
assert.equal(by.Z.excluded, true);
assert.equal(by.Z.rankApp, 1);
assert.equal(by.Z.rankStrict, '');
assert.equal(by.H.callsWed, 2);
assert.equal(by.H.departuresWed, 1);
assert.equal(by.H.callsSat, 1);
assert.equal(by.H.departuresSat, 0);
assert.equal(by.H.rankApp, 2);
assert.equal(by.H.rankStrict, 1);

// A feed without a dentist: the same hubs, no extra counts.
const plain = await hospitalSensitivity(g, feed({ ...STOPS, Z: 'Zaimoku' }), dates);
assert.equal(plain.same, true);
assert.equal(plain.app, undefined);
assert.equal(plain.stops.length, 1);
// Only a dentist: no hospital stop is left.
const only = await hospitalSensitivity(g, feed({ ...STOPS, H: 'Hiroba' }), dates);
assert.equal(only.same, false);
assert.equal(only.strict, null);
assert.deepEqual(only.hubsStrict, []);
// No service on the day.
assert.equal((await hospitalSensitivity(g, feed(STOPS), { date: '2026-10-25', sat: '2026-10-24' })).skip, 'no_service');

// Rows, CSV and national totals.
const f = { org: 'testorg', feed: 'test-bus', orgName: 'テスト町', feedName: 'テストバス', pref: 6, license: 'CC BY 4.0' };
const rows = hospitalStopRows(f, r);
assert.deepEqual(Object.keys(rows[0]).sort(), HOSPITAL_STOP_COLUMNS.slice().sort());
const csv = toCsv(HOSPITAL_STOP_COLUMNS, rows);
assert.equal(csv.charCodeAt(0), 0xfeff);
assert.ok(csv.includes('testorg,test-bus,6,Z,さくら歯科医院,36.000000,140.000000,4,3,1,1,1,1,\r\n'), csv);
const ch = changedRow(f, r);
assert.deepEqual(Object.keys(ch).sort(), CHANGED_COLUMNS.slice().sort());
assert.equal(ch.hubs_app, 'さくら歯科医院／中央病院');
assert.equal(ch.share_strict, 0.333);
assert.equal(changedRow(f, only).base_strict, '');
const t = summarise([{ f, res: r }, { f, res: plain }, { f, res: only }]);
assert.equal(t.feeds_with_service, 3);
assert.equal(t.hospital_named_stops, 2 + 1 + 1);
assert.equal(t.hospital_named_stops_dentist_or_vet, 2);
assert.equal(t.served_weekday, 4);
assert.equal(t.served_weekday_no_saturday_call, 0);
assert.equal(t.feeds_with_weekday_hospital_stop, 2);
assert.equal(t.feeds_where_no_hospital_stop_has_a_saturday_bus, 0);
assert.equal(t.feeds_whose_hubs_change, 2);
assert.equal(t.feeds_left_without_hospital_stop, 1);
assert.deepEqual(t.changed_feeds_strict_kept, { feeds: 1, base: 3, round_trip: 1, round_trip_sat: 0 });

console.log('sensitivity ok');
