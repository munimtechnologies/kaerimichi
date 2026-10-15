# 全国の公開GTFSで見る「バスで病院へ行って、その日のうちに帰ってこられるか」（2026-10-21）

GTFSデータリポジトリ（https://gtfs-data.jp/ ）で公開されている全国のバス等のGTFSデータについて、すべての停留所から
「そのデータ内の病院名の停留所へ行き、30分以上いて、その日のうちに戻ってこられるか」を、かえりみち（https://munimv2.github.io/kaerimichi/ ）と同じ計算で判定した結果です。
一覧と地図: https://munimv2.github.io/kaerimichi/national.html

- 対象日: 2026-10-21（水）と 2026-10-24（土）
- 分析したデータ: 394件（一覧 607件。対象外の理由は skipped.csv）
- 平日に発車がある停留所（病院の停留所を除く）: 53554か所
- そのうち日帰りで往復できる: 45007か所（84.0%）、土曜は 33881か所（63.3%）
- データごとの割合の中央値は 98.6%。平日は往復できるのに土曜はできないデータが97件、土曜に運行がないデータが78件あります。

## ファイル

- feeds.csv: データごとの集計（区分ごとの停留所数、往復できる割合、土曜の割合、かえりみちで同じ地図を開くURL）
- prefectures.csv: 都道府県ごとの集計
- stops/NN.csv: 停留所ごとの判定（NNは都道府県番号）。status は ok（直通で往復）、okx（乗り換えありで往復）、noreturn（行けるが帰りに間に合わない）、oneway（帰りの便がない）、none（行けない）、idle（その日は発車なし）、hub（病院の停留所）
- skipped.csv: 分析しなかったデータと理由
- findings.md: 割合の低いデータ、平日と土曜の差の大きいデータ、都道府県別の表
- summary.json: 設定と全国の合計
- sensitivity/: 病院名の停留所の一覧（平日・土曜の便数つき）と、歯科医院・動物病院を除いた場合の感度分析（下記）

## 方法

- 各データの病院の停留所は、停留所名に「病院・医院・クリニック・診療所・医療センター」を含むもの（かえりみちv0.6の「病院」ボタンと同じ）のうち、その日に便が止まるものを発車本数の多い順に最大3か所選びます。停留所ごとに、そのうち最も良い判定を採ります。
- 判定は、直通または同じデータ内での乗り換え1回（乗り継ぎ5分以上）、病院での滞在30分以上です。
- 割合の分母は、平日に発車がある停留所（病院の停留所を除く）です。土曜の割合も同じ分母で計算します。
- 同じ停留所名で400m以内のポールは1か所にまとめます。
- 集計スクリプトは tools/national_gaps.mjs（計算は gtfs.js）。2026-10-14に実行しました。

## 限界

- 病院は停留所名だけで見つけています。病院名の停留所は病院の近さの目安であり、病院名の停留所がないデータ（118件）は対象外です。
- 時刻表データだけを使っています。運賃、停留所までの歩行、遅れ・運休、別のデータ（別事業者・鉄道）との乗り継ぎは考慮していません。
- デマンド交通（予約制）は含みません。
- 同じ地域の停留所が複数のデータに含まれる場合、別々に数えています。
- 病院の停留所はデータごとに最大3か所です。地区ごとに別の病院へ向かう路線が多い大きなデータ（例: 鹿児島市「あいばす」19.4%）では、地区の病院へは行けても低く出ます。
- 到着用と出発用で名前が違う停留所（「（着）」「（発）」など）は別の停留所として扱うため、往復が見落とされることがあります（例: 八重瀬町バス 0.0%）。
- 停留所名のパターンは歯科医院・動物病院にも一致します（全国で36か所）。20件のデータで病院の停留所3か所のうち1か所が歯科医院でした。この集計ではそのまま含めています。除いた場合の影響は sensitivity/ で測りました: 全国の割合は84.0%・63.3%のまま変わりませんが、個々のデータでは差が出ます（下記）。かえりみちv0.7の「病院」ボタンは歯科医院・動物病院を除きます。
- 淡路市のデータの1停留所（禅坊靖寧前）は、元データで緯度と経度が入れ替わっています。stops/28.csv には元データのまま載せ、地図には表示しません（平日は発車なしのため、割合には影響しません）。
- 正式な「交通空白」の判断は自治体や運輸局が行うもので、この結果はその検討の材料です。

## 病院名の停留所と感度分析（sensitivity/）

tools/hospital_sensitivity.mjs を同じ日付で2026-10-14に実行した結果です（詳しくは sensitivity/README.md と sensitivity/findings.md）。

- 対象日に運行のある514件のデータに、病院名の停留所は1,503か所（うち歯科医院・動物病院36か所）。
- 平日に便がある1,454か所のうち、386か所（26.5%）は土曜に便がありません。歯科医院・動物病院を除いても26.6%です。
- 病院名の停留所に平日の便がある396件のデータのうち、97件では土曜はどの病院名の停留所にも便がありません。
- 歯科医院・動物病院を除くと病院の停留所3か所が変わるデータは20件で、病院の停留所が無くなるデータはありません。この20件の合計は、元の方法で2,646か所中2,251か所（土曜1,700）、除いた方法で2,654か所中2,256か所（土曜1,702）が往復できます。全国の割合は小数第1位まで変わりません（84.0%・63.3%）。
- 個々のデータでは差が出ます: 北名古屋市「きたバス」100%→74.3%（歯科医院前の停留所が3か所目の病院の停留所になっていて、そこへの往復だけで「往復できる」と判定されていた停留所が多かった）、塩尻市「すてっぷくん」87.8%→94.2%（歯科医院の代わりにまつもと医療センターが3か所目になった）、郡上市59.3%→60.8%、鶴岡市の土曜26.6%→27.3%。

## 出典とライセンス

データ: GTFSデータリポジトリと、feeds.csv に記載の各データの提供者（ライセンスは各行の license 列、多くは CC BY 4.0）。本データはそれらを加工して作成しました。
この集計（CSV・JSON・本文）は CC BY 4.0、集計スクリプト（tools/）は Apache-2.0 です。

制作: MV2 of Munim, Inc.（munimversion2@gmail.com）。この分析はMV2の名のもと、AIエージェントが作成しました。

---

# Same-day hospital round trips by bus from every stop in Japan's open GTFS feeds (2026-10-21)

For every feed in Japan's GTFS Data Repository, every stop is checked for one question: can you get from it to one of the
feed's hospital-named stops, stay at least 30 minutes and get back the same day? The calculation is the one the Kaerimichi
app shows (same code, gtfs.js). Tables and map: https://munimv2.github.io/kaerimichi/national.html?lang=en

- Dates: Wednesday 2026-10-21 and Saturday 2026-10-24
- Feeds analysed: 394 of 607 listed (reasons for the rest in skipped.csv)
- Stops with a weekday departure (hospital stops excluded): 53554
- Same-day round trip possible: 45007 (84.0%); on Saturday 33881 (63.3%)
- Median share per feed: 98.6%. 97 feeds allow the round trip on the weekday but not on Saturday; 78 have no Saturday service.

Method: hospital stops are the stops whose names contain 病院, 医院, クリニック, 診療所 or 医療センター and that some trip
serves that day, the three busiest per feed; each stop takes its best verdict over them. Direct buses or one transfer within
the same feed (at least 5 minutes to change), at least 30 minutes at the hospital. Both shares use the same base: stops with a
weekday departure, hospital stops excluded. Script: tools/national_gaps.mjs (calculation in gtfs.js), run on 2026-10-14.

Limits: hospitals are found only by stop names, so a hospital-named stop is a proxy and feeds without one (118) are skipped;
timetables only (no fares, walking, delays or connections to other feeds or rail); demand-responsive transit is not included;
stops that appear in more than one feed are counted once per feed. With at most three hospital stops per feed, large feeds
whose routes serve a different hospital in each district score low (Kagoshima's Aibus, 19.4%). Stops named separately for
arriving and departing (（着）/（発）) count as different stops, so a round trip through them can be missed (Yaese town bus,
0.0%). The name pattern also matches dentists and vets (36 stops nationwide): in 20 feeds one of the three hospital stops is a
dentist's (kept as is here; the sensitivity check below measures the effect, and the app's Hospital button leaves dentists and
vets out from v0.7). One stop in the Awaji city feed (禅坊靖寧前) has latitude and longitude swapped in the source data;
stops/28.csv keeps it as published and the map leaves it out (it has no weekday departure, so the shares are unaffected).
Official decisions on transport gaps (交通空白) are made by municipalities and MLIT's regional bureaus; this is input for that work.

**Hospital-named stops and sensitivity check (sensitivity/):** tools/hospital_sensitivity.mjs, run on 2026-10-14 for the same
dates (details in sensitivity/README.md and sensitivity/findings.md). The 514 feeds with service that day contain 1,503
hospital-named stops, 36 of them dentists or vets. Of the 1,454 with a weekday bus, 386 (26.5%) have no bus on Saturday (26.6%
without dentists and vets). In 97 of the 396 feeds with a weekday bus to a hospital-named stop, no such stop has a Saturday bus.
Leaving dentists and vets out changes the three hospital stops in 20 feeds and leaves none without a hospital stop; in those 20
feeds, 2,251 of 2,646 stops round-trip with the original method (Saturday 1,700) and 2,256 of 2,654 without dentists and vets
(Saturday 1,702), so the national shares stay 84.0% and 63.3% to one decimal. Single feeds do move: Kita-Nagoya's Kita Bus
100% → 74.3% (a stop in front of a dentist was the third hospital stop, and many stops could round-trip only to it), Shiojiri's
Step-kun 87.8% → 94.2% (Matsumoto Medical Center takes the dentist's place), Gujo 59.3% → 60.8%, Tsuruoka on Saturday 26.6% → 27.3%.

Data: the GTFS Data Repository and each feed's publisher, under the licence in each row of feeds.csv (mostly CC BY 4.0),
processed by MV2. This dataset is CC BY 4.0; the scripts are Apache-2.0. Made by MV2 of Munim, Inc.
(munimversion2@gmail.com) with AI agents working in MV2's name.
