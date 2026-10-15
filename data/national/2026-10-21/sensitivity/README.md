# 病院名の停留所の一覧と感度分析 / Hospital-named stops and a sensitivity check (2026-10-21, 土曜 2026-10-24)

全国版（../）の「病院の停留所」は停留所名だけで見つけているため、歯科医院や動物病院の停留所も一致します。
このフォルダは、(1) 全国の公開GTFSにある病院名の停留所をすべて、平日と土曜の便数つきで一覧にしたもの、(2) 歯科医院・動物病院を除くと
各データの病院の停留所3か所がどう変わり、往復できる停留所の数がどう変わるかを測ったものです。
スクリプト: ../../../../tools/hospital_sensitivity.mjs（計算は gtfs.js、全国版と同じ）。2026-10-14 23:26 UTC に実行。

The national edition (../) finds hospital stops by stop names, so dentists and vets match too. This folder lists (1) every
hospital-named stop in Japan's open GTFS feeds with its weekday and Saturday service and (2) how a feed's three hospital stops
and its round-trip counts change when dentists and vets are left out. Script: tools/hospital_sensitivity.mjs (same gtfs.js as
the national edition), run 2026-10-14 23:26 UTC.

## 結果 / Results

- 運行のあるデータ 514件（一覧607件。no_service 35、discontinued 28、ended 27、error 2（つくば市の2件: trips.txt なし）、flex_only 1）。
- 病院名の停留所（病院・医院・クリニック・診療所・医療センター）1,503か所、うち歯科医院・動物病院（歯科・動物病院・獣医）36か所。
- 平日に便がある 1,454か所のうち 386か所（26.5%）は土曜に便がない。歯科医院・動物病院を除くと 1,419か所中 377か所（26.6%）。
- 病院名の停留所に平日の便があるデータ 396件のうち、97件では土曜はどの病院名の停留所にも便がない。
- 歯科医院・動物病院を除くと病院の停留所3か所が変わるデータ: 20件（病院の停留所が無くなるデータ: 0件）。この20件の合計: 元の方法 2,646か所中 2,251か所が往復可（土曜 1,700）、除いた方法 2,654か所中 2,256か所（土曜 1,702）。全国の割合は 84.0%・63.3% のまま。
- データ単位の差（findings.md の表）: 北名古屋市「きたバス」100%→74.3%、塩尻市「すてっぷくん」87.8%→94.2%、郡上市 59.3%→60.8%、三豊市 98.8%→99.1%、鈴鹿市 73.2%→73.4%、鶴岡市の土曜 26.6%→27.3%。残りは変わらないか0.1ポイント台。

Feeds with service 514 of 607 listed (no_service 35, discontinued 28, ended 27, error 2 (two Tsukuba feeds without trips.txt),
flex_only 1). Hospital-named stops 1,503, of which 36 dentists or vets. Of the 1,454 with a weekday bus, 386 (26.5%) have no
Saturday bus (26.6% without dentists and vets). In 97 of the 396 feeds with a weekday bus to a hospital-named stop, no such stop
has a Saturday bus. Leaving dentists and vets out changes the three hospital stops in 20 feeds (none loses its last hospital
stop): 2,251 of 2,646 stops round-trip with the original method (Saturday 1,700), 2,256 of 2,654 without (Saturday 1,702); the
national shares stay 84.0% / 63.3%. Single feeds move: Kita-Nagoya 100% → 74.3%, Shiojiri 87.8% → 94.2%, Gujo 59.3% → 60.8%,
Tsuruoka Saturday 26.6% → 27.3%; the rest change by at most a few tenths of a point.

## ファイル / Files

- hospital_stops.csv: 病院名の停留所ごとに1行 / one row per hospital-named stop (UTF-8 BOM, CRLF)
  - organization_id, feed_id, pref_id: データ / the feed (as in ../feeds.csv)
  - stop_key, stop_name, lat, lon: 停留所（同名で400m以内のポールは1か所）/ the place (poles with the same name within 400 m are one place)
  - calls_wed, calls_sat: その日に止まる便の数 / buses that call there that day (2026-10-21, 2026-10-24)
  - departures_wed, departures_sat: そのうち先へ発車する便の数（終点到着は含まない）/ of those, buses that continue (a terminus arrival is a call but not a departure)
  - dentist_or_vet: 1 = 歯科・動物病院・獣医を含む名前 / name matches 歯科|動物病院|獣医
  - hub_rank_app: 元の方法（全国版・アプリv0.6まで）での病院の停留所の順位（1〜3、空 = 選ばれていない）/ rank among the feed's three hospital stops with the original pattern (blank = not one of them)
  - hub_rank_strict: 歯科医院・動物病院を除いた順位 / the same with dentists and vets left out
- changed_feeds.csv: 病院の停留所3か所が変わる20件 / the 20 feeds whose hospital stops change: hubs_app, hubs_strict, and for each
  method base (平日に発車がある停留所、病院の停留所を除く / stops with a weekday departure, hospital stops excluded), round_trip, share, round_trip_sat, share_sat
- skipped.csv: 分析しなかったデータと理由 / feeds not analysed and why
- summary.json: 合計 / the totals above, with the sha256 of the gtfs.js used
- findings.md: 上の結果と、20件の表 / the results above and the table of the 20 feeds

## 限界 / Limits

- 「病院名」は停留所名だけで判定しています。名前に病院を含まない停留所の前にある病院、病院の最寄りでも別名の停留所は数えていません。
- 「土曜に便がない」は、その停留所に止まる便が土曜のダイヤにないことで、祝日ダイヤや臨時便は見ていません。
- 全国版と同じ日に同じデータで実行しましたが、全国版の集計（2026-10-14 15:31 UTC）から約8時間後の取得です。その間にデータが更新されていれば、少数のデータで数字が全国版と一致しないことがあります。
- Hospital-named stops are a proxy: a hospital behind a stop with another name is not counted. "No Saturday bus" means no trip
  calls at the stop in the Saturday timetable; holiday timetables are not considered. The feeds were fetched about eight hours after
  the national edition's run on the same day, so a feed updated in between could differ slightly from ../feeds.csv.

出典 / Data: GTFSデータリポジトリ（https://gtfs-data.jp/ ）と各データの提供者（ライセンスは ../feeds.csv の license 列）。この集計は CC BY 4.0、スクリプトは Apache-2.0。
制作: MV2 of Munim, Inc.（munimversion2@gmail.com）。MV2の名のもと、AIエージェントが作成しました。
Made by MV2 of Munim, Inc. with AI agents working in MV2's name. This output is CC BY 4.0; the scripts are Apache-2.0.
