// hospital_names.mjs - for one feed: every hospital-named stop with its weekday and Saturday service, and
// whether leaving out dentists and vets (NOT_HOSPITAL) changes the feed's three hospital stops; if it does,
// the round-trip counts to both sets, so the national numbers can be corrected for it.
// MV2 of Munim, Inc. - Apache-2.0 license. Made with AI agents working in MV2's name.
import { HOSPITAL, NOT_HOSPITAL, ymd, hospitalHubs, analyseModel } from './lib.mjs';

const brief = r => ({ base: r.base, roundTrip: r.roundTrip, roundTripSat: r.roundTripSat, share: r.share, shareSat: r.shareSat });

export async function hospitalSensitivity(g, buf, { date, sat }) {
  const { model } = await g.loadFeed(buf);
  if (!model) return { skip: 'flex_only' };
  const view = g.dayView(model, ymd(date));
  if (!view.trips.length) return { skip: 'no_service' };
  const satView = g.dayView(model, ymd(sat));
  const app = hospitalHubs(model, view);
  const strict = hospitalHubs(model, view, NOT_HOSPITAL);
  const calls = (v, i) => (v.byPlace.get(i) || []).length;
  const stops = [];
  model.places.forEach((p, i) => {
    if (!HOSPITAL.test(p.name)) return;
    stops.push({
      key: p.key, name: p.name,
      lat: p.lat === undefined ? '' : p.lat.toFixed(6), lon: p.lon === undefined ? '' : p.lon.toFixed(6),
      callsWed: calls(view, i), callsSat: calls(satView, i),
      departuresWed: view.stat[i].n, departuresSat: satView.stat[i].n,
      excluded: NOT_HOSPITAL.test(p.name),
      rankApp: app.indexOf(i) + 1 || '', rankStrict: strict.indexOf(i) + 1 || '',
    });
  });
  const same = app.length === strict.length && app.every((h, k) => h === strict[k]);
  const res = {
    stops, same,
    hubsApp: app.map(i => model.places[i].name), hubsStrict: strict.map(i => model.places[i].name),
    tripsWed: view.trips.length, tripsSat: satView.trips.length,
  };
  if (!same) {
    res.app = brief(analyseModel(g, model, view, satView, app));
    res.strict = strict.length ? brief(analyseModel(g, model, view, satView, strict)) : null;
  }
  return res;
}
