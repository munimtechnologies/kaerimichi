# Compare MLIT's 2026 「交通空白」 list (districts each municipality says need a transport fix)
# with Kaerimichi's timetable measure (can a stop reach a hospital stop and get back the same day),
# municipality by municipality.
# MV2 of Munim, Inc. - made with AI agents in MV2's name. Apache-2.0.
import argparse
import csv
import io
import json
import os
import re
import statistics
import sys
import time
import unicodedata
import urllib.error
import urllib.request

UA = "Kaerimichi national analysis - MV2 of Munim, Inc. (munimversion2@gmail.com)"
LIST_URL = "https://www.mlit.go.jp/sogoseisaku/transport/content/002005736.pdf"
LIST_PDF = "002005736.pdf"
BOUNDS_URL = ("https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/"
              "data/municipality/geojson/s0010/N03-21_210101.json")
BOUNDS_FILE = "N03-21_210101_s0010.json"
NATIONAL = "https://raw.githubusercontent.com/munimtechnologies/kaerimichi/main/data/national/2026-10-21/"

PREFS = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県",
         "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県",
         "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府",
         "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県",
         "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県",
         "鹿児島県", "沖縄県"]
NUM = r"(\d[\d,]*(?:\.\d+)?|-)"
# Nine numbers, then the 計画の位置づけ mark (〇), the prefecture row's count, or a tenth '-'.
ROW_RE = re.compile(r"^(" + "|".join(PREFS) + r") (\S+)" + (r" " + NUM) * 9 + r"(?: (\d+|〇|-))?\s*$")
COLS = ["districts", "implementing", "preparing", "considering", "pop_k", "area_km2",
        "monitor_districts", "monitor_pop_k", "monitor_area_km2"]
# CJK radicals that PDF text extraction sometimes returns instead of the ordinary kanji (NFKC
# handles the Kangxi block but not these).
RADICALS = str.maketrans({"⻑": "長", "⻄": "西", "⻘": "青", "⻤": "鬼", "⻩": "黄", "⻝": "食",
                          "⻭": "歯", "⻁": "虎", "⻏": "阝", "⻆": "角", "⻲": "亀", "⻯": "竜"})
ROUND = ("ok", "okx")


def norm(name):
    """Normalise a municipality name so the PDF list and the boundary file agree."""
    s = unicodedata.normalize("NFKC", name or "").translate(RADICALS)
    s = s.replace("ヶ", "ケ").replace("ヵ", "カ").replace("　", "").replace(" ", "")
    return s.replace("檮", "梼")


def num(tok):
    if tok == "-":
        return None
    v = float(tok.replace(",", ""))
    return int(v) if v.is_integer() else v


def parse_list(lines):
    """Rows of the 地域の足 list: one per municipality, plus each prefecture's 自治体計 row."""
    rows, pref_totals = [], {}
    for line in lines:
        line = unicodedata.normalize("NFKC", line).translate(RADICALS).strip()
        m = ROW_RE.match(line)
        if not m:
            continue
        pref, name = m.group(1), m.group(2)
        vals = [num(t) for t in m.groups()[2:11]]
        rec = dict(zip(COLS, vals))
        if name == "自治体計":
            pref_totals[pref] = rec
            continue
        rec.update(pref=pref, name=name, key=pref + "/" + norm(name),
                   answered=vals[0] is not None, in_plan=m.group(12) == "〇")
        rows.append(rec)
    return rows, pref_totals


def grand_total(lines):
    for line in lines:
        line = unicodedata.normalize("NFKC", line).strip()
        if line.startswith("合計 "):
            return [num(t) for t in line.split()[1:10]]
    return None


def muni_key(props):
    """Municipality key for an N03 feature; wards of designated cities roll up to the city."""
    pref = props.get("N03_001") or ""
    gun_or_city = props.get("N03_003") or ""
    name = props.get("N03_004") or ""
    if gun_or_city.endswith("市") and name.endswith("区"):
        name = gun_or_city
    if not pref or not name:
        return None
    return pref + "/" + norm(name)


def is_round(status):
    return status in ROUND


def counted(status):
    """Same denominator as the national page: stops with a weekday departure, hubs excluded."""
    return status not in ("hub", "idle", "")


def rank(xs):
    order = sorted(range(len(xs)), key=lambda i: xs[i])
    r = [0.0] * len(xs)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and xs[order[j + 1]] == xs[order[i]]:
            j += 1
        for k in range(i, j + 1):
            r[order[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(xs, ys):
    if len(xs) < 3:
        return None
    rx, ry = rank(xs), rank(ys)
    mx, my = statistics.fmean(rx), statistics.fmean(ry)
    sxy = sum((a - mx) * (b - my) for a, b in zip(rx, ry))
    sxx = sum((a - mx) ** 2 for a in rx)
    syy = sum((b - my) ** 2 for b in ry)
    if sxx == 0 or syy == 0:
        return None
    return sxy / (sxx * syy) ** 0.5


def stats_block(a, b):
    """Compare two groups of municipal shares (a: listed a gap district, b: listed none)."""
    out = {"n_listed": len(a), "n_not_listed": len(b)}
    if a:
        out.update(median_listed=round(statistics.median(a), 3), mean_listed=round(statistics.fmean(a), 3))
    if b:
        out.update(median_not_listed=round(statistics.median(b), 3), mean_not_listed=round(statistics.fmean(b), 3))
    if a and b:
        try:
            from scipy.stats import mannwhitneyu
            res = mannwhitneyu(a, b, alternative="two-sided")
            out["mann_whitney_u"] = float(res.statistic)
            out["p_value"] = float(res.pvalue)
            # probability that a random listed municipality has a LOWER share than a random unlisted one
            out["prob_listed_lower"] = round(1 - res.statistic / (len(a) * len(b)), 3)
        except ImportError:
            pass
    return out


def fetch(url, path=None, tries=3):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=120) as r:
                data = r.read()
            if path:
                with open(path, "wb") as f:
                    f.write(data)
            return data
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            time.sleep(3)
        except Exception:
            if i == tries - 1:
                raise
            time.sleep(3)
    return None


def read_csv_bytes(data):
    return list(csv.DictReader(io.StringIO(data.decode("utf-8-sig"))))


def assign(stops, features, max_deg=0.05):
    """Municipality key for each stop: polygon containing it, else the nearest within max_deg."""
    import shapely
    from shapely.geometry import shape
    from shapely.strtree import STRtree
    geoms, keys = [], []
    for f in features:
        k = muni_key(f.get("properties") or {})
        if k and f.get("geometry"):
            geoms.append(shape(f["geometry"]))
            keys.append(k)
    tree = STRtree(geoms)
    pts = shapely.points([(float(s["lon"]), float(s["lat"])) for s in stops])
    out = [None] * len(stops)
    how = ["none"] * len(stops)
    pi, gi = tree.query(pts, predicate="intersects")
    for p, g in zip(pi, gi):
        if out[p] is None:
            out[p], how[p] = keys[g], "inside"
    for p in range(len(stops)):
        if out[p] is None:
            near = tree.query_nearest(pts[p], max_distance=max_deg)
            if len(near):
                out[p], how[p] = keys[int(near[0])], "nearest"
    return out, how


def aggregate(stops, keys):
    agg = {}
    for s, k in zip(stops, keys):
        if k is None or not counted(s.get("status", "")):
            continue
        a = agg.setdefault(k, {"stops": 0, "round_trip": 0, "round_trip_sat": 0, "feeds": set()})
        a["stops"] += 1
        a["round_trip"] += is_round(s["status"])
        a["round_trip_sat"] += is_round(s.get("status_sat", ""))
        a["feeds"].add(s["organization_id"] + "/" + s["feed_id"])
    return agg


def compare(rows, agg, min_stops):
    """Join the list with the timetable measure and build the comparisons."""
    joined = []
    for r in rows:
        a = agg.get(r["key"])
        j = dict(r)
        j["stops"] = a["stops"] if a else 0
        j["round_trip"] = a["round_trip"] if a else 0
        j["share"] = round(a["round_trip"] / a["stops"], 3) if a and a["stops"] else None
        j["share_sat"] = round(a["round_trip_sat"] / a["stops"], 3) if a and a["stops"] else None
        j["feeds"] = "／".join(sorted(a["feeds"])) if a else ""
        joined.append(j)
    usable = [j for j in joined if j["answered"] and j["stops"] >= min_stops]
    listed = [j["share"] for j in usable if j["districts"] > 0]
    not_listed = [j["share"] for j in usable if j["districts"] == 0]
    res = {
        "min_stops": min_stops,
        "municipalities_in_list": len(rows),
        "answered": sum(j["answered"] for j in joined),
        "with_any_stop": sum(j["stops"] > 0 for j in joined),
        "usable": len(usable),
        "weekday": stats_block(listed, not_listed),
        "saturday": stats_block([j["share_sat"] for j in usable if j["districts"] > 0],
                                [j["share_sat"] for j in usable if j["districts"] == 0]),
        "spearman_share_vs_districts": spearman([j["share"] for j in usable], [j["districts"] for j in usable]),
        "spearman_share_vs_gap_pop": spearman([j["share"] for j in usable], [j["pop_k"] for j in usable]),
    }
    low_unlisted = sorted([j for j in usable if j["districts"] == 0 and j["monitor_districts"] == 0
                           and j["share"] < 0.5], key=lambda j: j["share"])
    full_listed = sorted([j for j in usable if j["districts"] > 0 and j["share"] >= 0.95],
                         key=lambda j: -j["districts"])
    res["low_share_no_listed_gap"] = len(low_unlisted)
    res["full_share_listed_gap"] = len(full_listed)
    return joined, usable, low_unlisted, full_listed, res


def pref_rows(joined, pref_totals):
    out = []
    for p in PREFS:
        js = [j for j in joined if j["pref"] == p]
        stops = sum(j["stops"] for j in js)
        rt = sum(j["round_trip"] for j in js)
        t = pref_totals.get(p, {})
        out.append({"pref": p, "municipalities": len(js),
                    "municipalities_with_gap": sum(1 for j in js if (j["districts"] or 0) > 0),
                    "districts": t.get("districts", sum(j["districts"] or 0 for j in js)),
                    "gap_pop_k": t.get("pop_k"), "stops": stops,
                    "share": round(rt / stops, 3) if stops else None})
    return out


MUNI_COLS = ["pref", "name", "answered", "districts", "implementing", "preparing", "considering", "pop_k",
             "area_km2", "monitor_districts", "monitor_pop_k", "monitor_area_km2", "in_plan", "stops",
             "round_trip", "share", "share_sat", "feeds"]


def write_csv(path, rows, cols):
    with open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(r)


def pct(x):
    return "n/a" if x is None else f"{x * 100:.1f}%"


def findings(summary, low, full, prefs):
    c = summary["compare"]
    wd, sat = c["weekday"], c["saturday"]
    L = ["# MLIT 交通空白 list (2026) vs timetable round trips: findings", "",
         f"- List rows parsed: {summary['list']['rows']} municipalities ({summary['list']['answered']} answered); "
         f"districts {summary['list']['districts_sum']} (MLIT total {summary['list']['districts_total_line']}); "
         f"municipalities with ≥1 district: {summary['list']['municipalities_with_gap']}.",
         f"- Stops assigned to a municipality: {summary['assign']['inside']} inside a boundary, "
         f"{summary['assign']['nearest']} by nearest boundary (≤5 km), {summary['assign']['none']} unassigned.",
         f"- Municipalities with at least {c['min_stops']} analysed stops: {c['usable']} "
         f"({wd['n_listed']} listed a 交通空白 district, {wd['n_not_listed']} did not).",
         f"- Weekday share, median: listed {pct(wd.get('median_listed'))} vs not listed {pct(wd.get('median_not_listed'))}; "
         f"mean {pct(wd.get('mean_listed'))} vs {pct(wd.get('mean_not_listed'))}; "
         f"Mann-Whitney p = {wd.get('p_value', 'n/a')}; P(listed lower) = {wd.get('prob_listed_lower', 'n/a')}.",
         f"- Saturday share, median: listed {pct(sat.get('median_listed'))} vs not listed {pct(sat.get('median_not_listed'))}; "
         f"p = {sat.get('p_value', 'n/a')}.",
         f"- Spearman(share, districts) = {c['spearman_share_vs_districts']}; "
         f"Spearman(share, gap population) = {c['spearman_share_vs_gap_pop']}.",
         f"- Prefecture level (47): Spearman(share, districts) = {summary['prefecture_spearman_districts']}.", "",
         f"## Low timetable share (< 50%) but no listed or monitored district ({len(low)})", ""]
    for j in low[:40]:
        L.append(f"- {j['pref']} {j['name']}: {pct(j['share'])} of {j['stops']} stops (Sat {pct(j['share_sat'])}); feeds {j['feeds']}")
    L += ["", f"## Listed 交通空白 districts while ≥95% of analysed stops allow the round trip ({len(full)})", ""]
    for j in full[:40]:
        L.append(f"- {j['pref']} {j['name']}: {j['districts']} districts ({j['pop_k']}k people); "
                 f"{pct(j['share'])} of {j['stops']} stops")
    L += ["", "## Limits", "",
          "- The list is self-reported: each municipality drew its own districts with no common distance or frequency rule, "
          "and they include places with no stop at all, which a stop-based measure cannot see.",
          "- The timetable measure covers only feeds in the GTFS Data Repository with a hospital-named stop (394 of 607), "
          "so many municipalities have few or no analysed stops; a municipality's stops can come from another town's feed.",
          "- Stops are placed in municipalities with simplified (1%) 2021 boundaries (smartnews-smri/japan-topography, "
          "from MLIT 国土数値情報 N03); stops near a border can land in the neighbour.",
          "- Both are snapshots: the list was compiled 2026-05-15, the timetables are for 2026-10-21 and 2026-10-24.", ""]
    return "\n".join(L)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data-dir", default="/data")
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--min-stops", type=int, default=10)
    a = ap.parse_args()
    os.makedirs(a.data_dir, exist_ok=True)
    os.makedirs(a.out_dir, exist_ok=True)

    import pdfplumber
    pdf_path = os.path.join(a.data_dir, LIST_PDF)
    if not os.path.exists(pdf_path):
        fetch(LIST_URL, pdf_path)
    lines = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            lines.extend((page.extract_text() or "").splitlines())
    rows, pref_totals = parse_list(lines)
    total_line = grand_total(lines)

    b_path = os.path.join(a.data_dir, BOUNDS_FILE)
    if not os.path.exists(b_path):
        fetch(BOUNDS_URL, b_path)
    with open(b_path, encoding="utf-8") as f:
        features = json.load(f)["features"]
    bound_keys = {muni_key(f.get("properties") or {}) for f in features} - {None}

    stops = []
    for i in range(1, 48):
        data = fetch(NATIONAL + f"stops/{i:02d}.csv")
        if data:
            stops.extend(read_csv_bytes(data))
        time.sleep(0.5)
    print("stops rows", len(stops))
    keys, how = assign(stops, features)
    agg = aggregate(stops, keys)
    joined, usable, low, full, cmp = compare(rows, agg, a.min_stops)
    prefs = pref_rows(joined, pref_totals)
    pr = [p for p in prefs if p["share"] is not None]

    unmatched_list = [r["pref"] + " " + r["name"] for r in rows if r["key"] not in bound_keys]
    stop_keys = set(agg)
    list_keys = {r["key"] for r in rows}
    stops_outside_list = sorted(k for k in stop_keys if k not in list_keys)
    summary = {
        "list": {"source": LIST_URL, "rows": len(rows), "answered": sum(r["answered"] for r in rows),
                 "districts_sum": sum(r["districts"] or 0 for r in rows),
                 "districts_total_line": total_line[0] if total_line else None,
                 "municipalities_with_gap": sum(1 for r in rows if (r["districts"] or 0) > 0),
                 "prefecture_total_rows": len(pref_totals)},
        "boundaries": {"source": BOUNDS_URL, "features": len(features), "municipalities": len(bound_keys)},
        "stops": {"rows": len(stops), "counted": sum(counted(s.get("status", "")) for s in stops)},
        "assign": {k: how.count(k) for k in ("inside", "nearest", "none")},
        "unmatched_list_names": unmatched_list,
        "stop_municipalities_not_in_list": stops_outside_list,
        "compare": cmp,
        "prefecture_spearman_districts": spearman([p["share"] for p in pr], [p["districts"] or 0 for p in pr]),
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }
    write_csv(os.path.join(a.out_dir, "municipalities.csv"), joined, MUNI_COLS)
    write_csv(os.path.join(a.out_dir, "low_share_no_listed_gap.csv"), low, MUNI_COLS)
    write_csv(os.path.join(a.out_dir, "listed_gap_full_share.csv"), full, MUNI_COLS)
    write_csv(os.path.join(a.out_dir, "prefectures.csv"), prefs,
              ["pref", "municipalities", "municipalities_with_gap", "districts", "gap_pop_k", "stops", "share"])
    with open(os.path.join(a.out_dir, "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=1)
    with open(os.path.join(a.out_dir, "findings.md"), "w", encoding="utf-8") as f:
        f.write(findings(summary, low, full, prefs))
    print(json.dumps({k: summary[k] for k in ("list", "stops", "assign", "compare",
                                                "prefecture_spearman_districts")}, ensure_ascii=False, indent=1))
    print("unmatched list names:", len(unmatched_list), unmatched_list[:30])
    if summary["list"]["districts_sum"] != summary["list"]["districts_total_line"]:
        print("WARNING: parsed district sum differs from the 合計 line")
        sys.exit(2)


if __name__ == "__main__":
    main()
