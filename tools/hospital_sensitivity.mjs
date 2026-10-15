// hospital_sensitivity.mjs - a check on the national hospital round-trip results (national_gaps.mjs).
// The app's 病院 pattern also matches dentists (歯科医院) and vets (動物病院). For every feed in the GTFS Data
// Repository this lists each hospital-named stop with its weekday and Saturday service, and, for the feeds where
// leaving out dentists and vets changes the three hospital stops, the round-trip counts to both sets.
// Usage: node tools/hospital_sensitivity.mjs --date 2026-10-21 --sat 2026-10-24 --out out [--limit N] [--budget-min 120] [--heap-mb 3072]
// MV2 of Munim, Inc. - Apache-2.0 license. Made with AI agents working in MV2's name.
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { HOSPITAL, NOT_HOSPITAL, SKIP_COLUMNS, ymd, round3, prefName, skipReason, zipUrl, toCsv } from './lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const UA = 'Kaerimichi national analysis - MV2 of Munim, Inc. (munimversion2@gmail.com)';
const FEED_LIMIT_MS = 120000;

export const HOSPITAL_STOP_COLUMNS = ['organization_id', 'feed_id', 'pref_id', 'stop_key', 'stop_name', 'lat', 'lon',
  'calls_wed', 'departures_wed', 'calls_sat', 'departures_sat', 'dentist_or_vet', 'hub_rank_app', 'hub_rank_strict'];
export const CHANGED_COLUMNS = ['organization_id', 'feed_id', 'organization_name', 'feed_name', 'pref_id', 'hubs_app', 'hubs_strict',
  'base_app', 'round_trip_app', 'share_app', 'round_trip_sat_app', 'share_sat_app',
  'base_strict', 'round_trip_strict', 'share_strict', 'round_trip_sat_strict', 'share_sat_strict'];

const argv = process.argv.slice(2);
const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : dflt; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pct = x => (x === null || x === undefined ? '–' : (x * 100).toFixed(1) + '%');

async function get(url, as = 'text') {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(180000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return as === 'buffer' ? res.arrayBuffer() : res.text();
}

const skipRow = (f, reason, detail = '') => ({ organization_id: f.org, feed_id: f.feed, feed_name: f.feedName, reason, detail: String(detail).slice(0, 200) });

export function hospitalStopRows(f, res) {
  return res.stops.map(s => ({
    organization_id: f.org, feed_id: f.feed, pref_id: f.pref, stop_key: s.key, stop_name: s.name, lat: s.lat, lon: s.lon,
    calls_wed: s.callsWed, departures_wed: s.departuresWed, calls_sat: s.callsSat, departures_sat: s.departuresSat,
    dentist_or_vet: s.excluded ? 1 : 0, hub_rank_app: s.rankApp, hub_rank_strict: s.rankStrict,
  }));
}

export function changedRow(f, res) {
  const a = res.app, s = res.strict || {};
  const v = x => (x === null || x === undefined ? '' : x);
  return {
    organization_id: f.org, feed_id: f.feed, organization_name: f.orgName, feed_name: f.feedName, pref_id: f.pref,
    hubs_app: res.hubsApp.join('／'), hubs_strict: res.hubsStrict.join('／'),
    base_app: a.base, round_trip_app: a.roundTrip, share_app: v(a.share), round_trip_sat_app: a.roundTripSat, share_sat_app: v(a.shareSat),
    base_strict: v(s.base), round_trip_strict: v(s.roundTrip), share_strict: v(s.share),
    round_trip_sat_strict: v(s.roundTripSat), share_sat_strict: v(s.shareSat),
  };
}

// National totals from the per-feed results: hospital stops by service, and what leaving out dentists and vets changes.
export function summarise(done) {
  const stops = done.flatMap(d => d.res.stops);
  const servedWed = stops.filter(s => s.callsWed > 0);
  const noSat = servedWed.filter(s => s.callsSat === 0);
  const real = servedWed.filter(s => !s.excluded);
  const realNoSat = real.filter(s => s.callsSat === 0);
  const withHosp = done.filter(d => d.res.stops.some(s => s.callsWed > 0 && !s.excluded));
  const noSatHosp = withHosp.filter(d => !d.res.stops.some(s => s.callsSat > 0 && !s.excluded));
  const changed = done.filter(d => !d.res.same);
  const lost = changed.filter(d => !d.res.strict);
  const kept = changed.filter(d => d.res.strict);
  const sum = (list, side, k) => list.reduce((t, d) => t + d.res[side][k], 0);
  return {
    feeds_with_service: done.length,
    hospital_named_stops: stops.length,
    hospital_named_stops_dentist_or_vet: stops.filter(s => s.excluded).length,
    served_weekday: servedWed.length,
    served_weekday_no_saturday_call: noSat.length,
    share_no_saturday_call: servedWed.length ? round3(noSat.length / servedWed.length) : null,
    served_weekday_excluding_dentist_vet: real.length,
    excluding_dentist_vet_no_saturday_call: realNoSat.length,
    share_excluding_dentist_vet_no_saturday_call: real.length ? round3(realNoSat.length / real.length) : null,
    feeds_with_weekday_hospital_stop: withHosp.length,
    feeds_where_no_hospital_stop_has_a_saturday_bus: noSatHosp.length,
    feeds_whose_hubs_change: changed.length,
    feeds_left_without_hospital_stop: lost.length,
    changed_feeds_app: changed.length ? { base: sum(changed, 'app', 'base'), round_trip: sum(changed, 'app', 'roundTrip'), round_trip_sat: sum(changed, 'app', 'roundTripSat') } : null,
    changed_feeds_strict_kept: kept.length ? { feeds: kept.length, base: sum(kept, 'strict', 'base'), round_trip: sum(kept, 'strict', 'roundTrip'), round_trip_sat: sum(kept, 'strict', 'roundTripSat') } : null,
    changed_feeds_lost_app: lost.length ? { base: sum(lost, 'app', 'base'), round_trip: sum(lost, 'app', 'roundTrip'), round_trip_sat: sum(lost, 'app', 'roundTripSat') } : null,
  };
}

function findings(s, done) {
  const t = s.totals;
  const changed = done.filter(d => !d.res.same && d.res.app)
    .map(d => ({ d, drop: (d.res.app.share || 0) - ((d.res.strict && d.res.strict.share) || 0) }))
    .sort((a, b) => b.drop - a.drop);
  const lines = [
    `# Hospital-named bus stops in Japan's open GTFS feeds, and a check on the round-trip results (${s.date}, Saturday ${s.saturday})`,
    '',
    `Feeds with service on ${s.date}: ${t.feeds_with_service} of ${s.feeds_listed} listed. Skipped: ${Object.entries(s.skipped_by_reason).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}.`,
    `Hospital-named stops (${HOSPITAL.source}): ${t.hospital_named_stops}, of which ${t.hospital_named_stops_dentist_or_vet} are dentists or vets (${NOT_HOSPITAL.source}).`,
    `With a bus on the weekday: ${t.served_weekday}; of these ${t.served_weekday_no_saturday_call} (${pct(t.share_no_saturday_call)}) have no bus on Saturday.`,
    `Leaving out dentists and vets: ${t.served_weekday_excluding_dentist_vet} stops, ${t.excluding_dentist_vet_no_saturday_call} (${pct(t.share_excluding_dentist_vet_no_saturday_call)}) without a Saturday bus.`,
    `Feeds with a weekday bus to a hospital-named stop (dentists and vets left out): ${t.feeds_with_weekday_hospital_stop}; in ${t.feeds_where_no_hospital_stop_has_a_saturday_bus} of them no such stop has a bus on Saturday.`,
    '',
    '## Effect on the round-trip results',
    '',
    `Feeds whose three hospital stops change when dentists and vets are left out: ${t.feeds_whose_hubs_change}; of these ${t.feeds_left_without_hospital_stop} have no hospital stop left.`,
    t.changed_feeds_app ? `In the changed feeds, with the app's pattern: ${t.changed_feeds_app.round_trip} of ${t.changed_feeds_app.base} stops round trip (Saturday ${t.changed_feeds_app.round_trip_sat}).` : '',
    t.changed_feeds_strict_kept ? `In the ${t.changed_feeds_strict_kept.feeds} changed feeds that keep a hospital stop: ${t.changed_feeds_strict_kept.round_trip} of ${t.changed_feeds_strict_kept.base} stops round trip (Saturday ${t.changed_feeds_strict_kept.round_trip_sat}).` : '',
    '',
    '| feed | prefecture | hospital stops (app) | without dentists and vets | share (app) | share (without) | Saturday (app) | Saturday (without) |',
    '|---|---|---|---|---|---|---|---|',
    ...changed.map(({ d }) => `| ${d.f.orgName}「${d.f.feedName}」 | ${prefName(d.f.pref)} | ${d.res.hubsApp.join('／')} | ${d.res.hubsStrict.join('／') || '–'} | ${pct(d.res.app.share)} | ${pct(d.res.strict && d.res.strict.share)} | ${pct(d.res.app.shareSat)} | ${pct(d.res.strict && d.res.strict.shareSat)} |`),
    '',
    'Made by MV2 of Munim, Inc. with AI agents working in MV2\'s name. Data: the GTFS Data Repository (https://gtfs-data.jp/) and each feed\'s publisher; this output is CC BY 4.0, the scripts Apache-2.0.',
    '',
  ];
  return lines.filter((l, k) => l !== '' || lines[k - 1] !== '').join('\n');
}

async function main() {
  const date = arg('date', '2026-10-21');
  const sat = arg('sat', '2026-10-24');
  const outRoot = arg('out', 'out');
  const limit = +arg('limit', 0) || Infinity;
  const budgetMs = (+arg('budget-min', 120)) * 60000;
  const heapMb = +arg('heap-mb', 3072) || 3072;
  const started = Date.now();
  const out = join(outRoot, 'sensitivity', date);
  mkdirSync(out, { recursive: true });
  const text = readFileSync(join(HERE, '..', 'gtfs.js'), 'utf8');
  const gtfsPath = join(outRoot, 'gtfs-used.mjs');
  writeFileSync(gtfsPath, text);
  const gtfsInfo = { source: 'gtfs.js', sha256: createHash('sha256').update(text).digest('hex') };
  const g = await import(pathToFileURL(gtfsPath).href);
  console.log('gtfs.js', JSON.stringify(gtfsInfo));
  const feeds = g.parseFeedList(await get('https://api.gtfs-data.jp/v2/feeds'));
  if (feeds.length < 100) throw new Error('only ' + feeds.length + ' feeds in the API list');
  console.log(`feeds listed: ${feeds.length}`);
  const day = ymd(date);
  const done = [], skipped = [];
  const zipPath = join(tmpdir(), 'kaerimichi-sens.zip');
  const resPath = join(tmpdir(), 'kaerimichi-sens.json');
  let tried = 0;

  for (const f of feeds) {
    const why = skipReason(f, day);
    if (why) { skipped.push(skipRow(f, why)); continue; }
    if (tried >= limit || Date.now() - started > budgetMs) { skipped.push(skipRow(f, 'not_reached')); continue; }
    if (tried++) await sleep(2000);
    let buf;
    try {
      buf = await get(zipUrl(f), 'buffer');
    } catch (e) {
      try {
        await sleep(5000);
        buf = await get(zipUrl(f), 'buffer');
      } catch (e2) {
        skipped.push(skipRow(f, 'download_failed', e2.message || e2));
        continue;
      }
    }
    writeFileSync(zipPath, Buffer.from(buf));
    if (existsSync(resPath)) unlinkSync(resPath);
    const t0 = Date.now();
    const r = spawnSync(process.execPath, [`--max-old-space-size=${heapMb}`, join(HERE, 'sens_worker.mjs'), gtfsPath, zipPath, date, sat, resPath],
      { timeout: FEED_LIMIT_MS, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    if (r.error && r.error.code === 'ETIMEDOUT') { skipped.push(skipRow(f, 'timeout', `${FEED_LIMIT_MS / 1000} s`)); console.log(`timeout ${f.org}/${f.feed}`); continue; }
    if (r.status !== 0 || !existsSync(resPath)) { skipped.push(skipRow(f, 'crashed', (r.signal || '') + ' ' + (r.stderr || '').slice(-180))); console.log(`crashed ${f.org}/${f.feed}`); continue; }
    const res = JSON.parse(readFileSync(resPath, 'utf8'));
    if (res.skip) { skipped.push(skipRow(f, res.skip, res.detail || '')); console.log(`skip ${res.skip} ${f.org}/${f.feed}`); continue; }
    done.push({ f, res });
    console.log(`ok ${f.org}/${f.feed} ${secs}s hospital_stops=${res.stops.length} same=${res.same}`
      + (res.same ? '' : ` app=${res.app.share} strict=${res.strict ? res.strict.share : 'none'}`));
  }

  done.sort((a, b) => (a.f.pref - b.f.pref) || a.f.org.localeCompare(b.f.org) || a.f.feed.localeCompare(b.f.feed));
  writeFileSync(join(out, 'hospital_stops.csv'), toCsv(HOSPITAL_STOP_COLUMNS, done.flatMap(({ f, res }) => hospitalStopRows(f, res))));
  writeFileSync(join(out, 'changed_feeds.csv'), toCsv(CHANGED_COLUMNS, done.filter(d => !d.res.same).map(({ f, res }) => changedRow(f, res))));
  writeFileSync(join(out, 'skipped.csv'), toCsv(SKIP_COLUMNS, skipped));
  const byReason = {};
  for (const s of skipped) byReason[s.reason] = (byReason[s.reason] || 0) + 1;
  const summary = {
    title: 'Hospital-named bus stops in Japan\'s open GTFS feeds, and how much dentists and vets change the round-trip results',
    date, saturday: sat, hospital_stop_names: HOSPITAL.source, dentist_or_vet_names: NOT_HOSPITAL.source,
    feeds_listed: feeds.length, skipped_by_reason: byReason, totals: summarise(done), gtfs_js: gtfsInfo,
    generated_at: new Date().toISOString(), runtime_s: Math.round((Date.now() - started) / 1000),
    by: 'MV2 of Munim, Inc. (made with AI agents working in MV2\'s name)',
  };
  writeFileSync(join(out, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  writeFileSync(join(out, 'findings.md'), findings(summary, done));
  console.log(JSON.stringify(summary, null, 2));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch(e => { console.error(e); process.exit(1); });
