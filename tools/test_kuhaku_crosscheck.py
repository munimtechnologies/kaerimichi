# Tests for kuhaku_crosscheck.py. MV2 of Munim, Inc. - Apache-2.0.
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import kuhaku_crosscheck as cc  # noqa: E402

LINES = """都道府県名 市町村名 総数 実施中 準備中 検討中 総計
北海道 札幌市 2 2 0 0 2 2 0 0 0
北海道 函館市 1 0 1 0 10 331 0 0 0 〇
岩手県 遠野市 - - - - - - - - - -
⻑野県 南牧村 3 1 2 0 1,204 12.5 0 0 0
鹿児島県 自治体計 110 67 37 6 346 3,192 9 34 607 21
1 / 20 ページ
合計 2,740 1,274 1,124 342 17,207 115,737 1,498 6,096 36,411 541""".splitlines()


class ParseList(unittest.TestCase):
    def test_rows(self):
        rows, totals = cc.parse_list(LINES)
        self.assertEqual([r["name"] for r in rows], ["札幌市", "函館市", "遠野市", "南牧村"])
        sapporo, hakodate, tono, minamimaki = rows
        self.assertEqual(sapporo["districts"], 2)
        self.assertFalse(sapporo["in_plan"])
        self.assertTrue(hakodate["in_plan"])
        self.assertEqual(hakodate["area_km2"], 331)
        self.assertFalse(tono["answered"])
        self.assertIsNone(tono["districts"])
        self.assertEqual(minamimaki["pref"], "長野県")
        self.assertEqual(minamimaki["pop_k"], 1204)
        self.assertEqual(minamimaki["area_km2"], 12.5)
        self.assertEqual(totals["鹿児島県"]["districts"], 110)
        self.assertEqual(totals["鹿児島県"]["area_km2"], 3192)

    def test_grand_total(self):
        self.assertEqual(cc.grand_total(LINES)[0], 2740)
        self.assertEqual(cc.grand_total(LINES)[6], 1498)


class Keys(unittest.TestCase):
    def test_designated_city_wards_roll_up(self):
        self.assertEqual(cc.muni_key({"N03_001": "北海道", "N03_003": "札幌市", "N03_004": "中央区"}), "北海道/札幌市")

    def test_tokyo_wards_stay(self):
        self.assertEqual(cc.muni_key({"N03_001": "東京都", "N03_003": None, "N03_004": "千代田区"}), "東京都/千代田区")

    def test_town_in_gun(self):
        self.assertEqual(cc.muni_key({"N03_001": "北海道", "N03_003": "石狩郡", "N03_004": "当別町"}), "北海道/当別町")

    def test_missing_name(self):
        self.assertIsNone(cc.muni_key({"N03_001": "北海道", "N03_004": None}))

    def test_norm(self):
        self.assertEqual(cc.norm("鰺ヶ沢町"), cc.norm("鰺ケ沢町"))
        self.assertEqual(cc.norm("⻑与町"), "長与町")


class Stats(unittest.TestCase):
    def test_spearman(self):
        self.assertAlmostEqual(cc.spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1.0)
        self.assertAlmostEqual(cc.spearman([1, 2, 3, 4], [4, 3, 2, 1]), -1.0)
        self.assertIsNone(cc.spearman([1, 1, 1], [1, 2, 3]))

    def test_rank_ties(self):
        self.assertEqual(cc.rank([5, 1, 5]), [2.5, 1.0, 2.5])


def stop(org, status, sat="idle", lat=35.0, lon=135.0):
    return {"organization_id": org, "feed_id": "f", "status": status, "status_sat": sat,
            "lat": str(lat), "lon": str(lon)}


class Compare(unittest.TestCase):
    def test_aggregate_and_compare(self):
        stops = [stop("a", "ok", "ok"), stop("a", "okx"), stop("a", "none"), stop("a", "hub"), stop("a", "idle"),
                 stop("b", "ok"), stop("b", "ok", "okx")]
        keys = ["X県/甲町"] * 5 + ["X県/乙村"] * 2
        agg = cc.aggregate(stops, keys)
        self.assertEqual(agg["X県/甲町"]["stops"], 3)
        self.assertEqual(agg["X県/甲町"]["round_trip"], 2)
        self.assertEqual(agg["X県/甲町"]["round_trip_sat"], 1)
        rows = [
            {"pref": "X県", "name": "甲町", "key": "X県/甲町", "answered": True, "districts": 2, "pop_k": 3,
             "monitor_districts": 0},
            {"pref": "X県", "name": "乙村", "key": "X県/乙村", "answered": True, "districts": 0, "pop_k": 0,
             "monitor_districts": 0},
            {"pref": "X県", "name": "丙村", "key": "X県/丙村", "answered": False, "districts": None, "pop_k": None,
             "monitor_districts": None},
        ]
        joined, usable, low, full, res = cc.compare(rows, agg, 2)
        self.assertEqual(len(usable), 2)
        self.assertEqual(joined[0]["share"], round(2 / 3, 3))
        self.assertEqual(joined[1]["share"], 1.0)
        self.assertEqual(joined[2]["stops"], 0)
        self.assertEqual(res["weekday"]["n_listed"], 1)
        self.assertEqual(res["weekday"]["n_not_listed"], 1)
        self.assertEqual(low, [])
        self.assertEqual(full, [])


try:
    import shapely  # noqa: F401
except ImportError:
    shapely = None


@unittest.skipUnless(shapely, "needs shapely")
class Assign(unittest.TestCase):
    def test_inside_nearest_none(self):
        sq = lambda x0: {"type": "Polygon", "coordinates": [[[x0, 0], [x0 + 1, 0], [x0 + 1, 1], [x0, 1], [x0, 0]]]}
        features = [{"properties": {"N03_001": "X県", "N03_004": "甲町"}, "geometry": sq(0)},
                    {"properties": {"N03_001": "X県", "N03_004": "乙村"}, "geometry": sq(2)}]
        stops = [stop("a", "ok", lat=0.5, lon=0.5), stop("a", "ok", lat=0.5, lon=2.5),
                 stop("a", "ok", lat=0.5, lon=1.02), stop("a", "ok", lat=34.6, lon=134.9)]
        keys, how = cc.assign(stops, features)
        self.assertEqual(keys, ["X県/甲町", "X県/乙村", "X県/甲町", None])
        self.assertEqual(how, ["inside", "inside", "nearest", "none"])


if __name__ == "__main__":
    unittest.main()
