# 国土交通省「交通空白」リスト（2026）と時刻表の往復判定の突き合わせ / MLIT's 2026 transport-gap list vs timetable round trips

国土交通省が2026年に公表した、市区町村ごとの「交通空白」地区の一覧（地域の足、2026-05-15時点、
https://www.mlit.go.jp/sogoseisaku/transport/content/002005736.pdf ）と、全国版（../）の時刻表による判定
「その停留所から病院名の停留所へ行き、30分以上いて、その日のうちに戻れるか」を、市区町村ごとに突き合わせました。
スクリプト: ../../../../tools/kuhaku_crosscheck.py（Apache-2.0）。2026-10-15 07:55 UTC に実行。

We joined MLIT's 2026 list of transport-gap (交通空白) districts, which each municipality reported for itself (status as of
2026-05-15, PDF above), with the national edition's timetable check (../): can you get from a stop to a hospital-named stop,
stay at least 30 minutes and get back the same day? The join is by municipality. Script: tools/kuhaku_crosscheck.py
(Apache-2.0), run 2026-10-15 07:55 UTC.

## 結果 / Results

- 一覧の読み取り: 1,741市区町村（回答 1,705）、交通空白地区の合計 2,740（国交省の「合計」行と一致）。地区が1つ以上ある市区町村は892。一覧の市区町村名はすべて境界データと一致しました（不一致 0）。
- 停留所の市区町村への割り当て: 57,765か所のうち 57,621か所は境界の内側、143か所は最寄りの境界（5km以内）、1か所は割り当てなし。
- 比べられる市区町村（回答あり・分析した停留所10か所以上）: 453（交通空白地区あり 254、なし 199）。
- 平日に往復できる停留所の割合（市区町村ごと）の中央値: 地区あり **95.9%**、地区なし **98.3%**（平均 81.7% と 85.7%）。Mann-Whitney 検定 p = 0.025。地区ありの市区町村を1つ、なしを1つ無作為に選んだとき、地区ありの方が低い確率は **0.56**（0.5 なら差なし）。
- 土曜: 中央値 71.8% と 85.0%、p = 0.039、確率 0.556。
- 地区の数・地区の人口と割合の順位相関（スピアマン）: −0.07 と −0.09。都道府県単位（停留所のある41都道府県）では −0.22。
- 交通空白地区を挙げているのに、分析した停留所の95%以上で往復できる市区町村: **254のうち136**（例: 美濃加茂市 44地区・213停留所で100%、一関市 8地区・421停留所で98.8%）。
- 割合が50%未満なのに、交通空白地区もモニタリング地区も挙げていない市区町村: 12（水俣市 13.2%、荒尾市 20.2%、錦町・五木村 0.0% など）。

**読み方:** 自治体が挙げた交通空白と、既存の停留所から時刻表で病院へ日帰りできるかは、ほとんど重なりません。差はあるものの小さく
（無作為の1組で 0.56）、地区の数とはほぼ無関係です。交通空白地区の多くは、停留所が近くにない場所や、病院以外の用事（買い物、
通学、観光）の足の問題と考えられ、停留所ごとの時刻表の判定では見えません。逆に、時刻表の判定は自治体の一覧を置き換えるものではなく、
一覧にない「停留所はあるが帰ってこられない」場所を探す材料になります。

**12の「割合が低いのに一覧にない」市区町村は、そのまま「見落とし」とは読めません。** 全国版は各データの病院の停留所を最大3か所しか
選ばないため、広い地域を走るデータでは、町の病院ではなく別の市の病院への往復を判定しています。例えば熊本県の4市町村（水俣市・荒尾市・
錦町・五木村）の停留所は「産交バス」のデータに入っていて、その病院の停留所は 寺尾病院前・総合病院前・天草中央総合病院前 です。
富岡町の停留所が入る「新常磐交通」の病院の停留所は、いわき市の 医療センター入口・労災病院入口・医療センター です。
これらの低い割合は「そのデータの病院の停留所へ日帰りできない」という意味で、「町から病院へ行けない」という意味ではありません。
確かめる候補の一覧として使ってください。

**How to read it:** the gaps municipalities reported and whether existing stops allow a same-day hospital round trip barely
overlap. Municipalities that listed a gap district do score lower, but only slightly (a random listed municipality is lower than
a random unlisted one 56% of the time; 50% would mean no difference), and the number of districts is almost unrelated to the
share (Spearman −0.07). In 136 of the 254 listed municipalities, at least 95% of analysed stops allow the round trip. Most listed
districts are likely places with no stop nearby or needs other than the hospital (shopping, school, visitors), which a per-stop
timetable check cannot see. The other way round, the timetable check does not replace the municipalities' lists; it is a way to
find places that have a stop but no bus back.

**The 12 municipalities with a low share and no listed district are not simply "missed gaps".** The national edition uses at
most three hospital stops per feed, so in a feed that covers a wide area a town's stops are judged against another town's
hospitals. The four Kumamoto municipalities (Minamata, Arao, Nishiki, Itsuki) are served by the Sanko Bus feed, whose hospital
stops are 寺尾病院前, 総合病院前 and 天草中央総合病院前; Tomioka (Fukushima) is served by Shin-Joban Kotsu, whose hospital stops
are in Iwaki. A low share there means "no same-day round trip to that feed's hospital stops", not "no way to reach a hospital".
Use the list as places to check.

## ファイル / Files

- municipalities.csv: 一覧の1,741市区町村すべて / every municipality in the list (UTF-8 BOM)
  - pref, name, answered（回答の有無 / whether it answered）
  - districts, implementing, preparing, considering: 交通空白地区の数と、対策の実施中・準備中・検討中の数 / gap districts and how many have measures in place, in preparation or under consideration
  - pop_k, area_km2: 地区の人口（千人）と面積（km²）/ population (thousands) and area of those districts
  - monitor_districts, monitor_pop_k, monitor_area_km2: モニタリング中の地区 / districts under monitoring
  - in_plan: 計画に位置づけ（〇）/ marked as in the local transport plan
  - stops, round_trip, share, share_sat: 市区町村内の、平日に発車がある停留所（病院の停留所を除く）、そのうち平日に往復できる数、平日と土曜の割合 / stops with a weekday departure (hospital stops excluded), how many round-trip on the weekday, and the weekday and Saturday shares
  - feeds: 停留所が入っているデータ（organization_id/feed_id）/ the feeds those stops come from
- prefectures.csv: 都道府県ごと（地区数と人口は一覧の「自治体計」行）/ per prefecture (districts and population from the list's prefecture rows)
- low_share_no_listed_gap.csv: 割合50%未満で地区もモニタリング地区もない12市区町村 / the 12 above
- listed_gap_full_share.csv: 地区があり割合95%以上の136市区町村 / the 136 above
- summary.json: 件数と統計 / counts and statistics (sources, matching, Mann-Whitney, Spearman)
- findings.md: 上の結果の自動まとめ / the automatic summary the script writes

## 方法 / Method

- 一覧のPDFを pdfplumber で文字として読み、1行ずつ数値を取り出しました。都道府県ごとの「自治体計」と全国の「合計」で検算しています（地区数 2,740 が一致）。
- 停留所（../stops/NN.csv）を、国土数値情報 行政区域（N03、2021年）を1%に簡略化した境界（smartnews-smri/japan-topography）で市区町村に割り当てました。政令市の区は市にまとめます。境界の外の停留所は5km以内の最寄りの市区町村に入れます。
- 市区町村の割合 = 往復できる停留所 ÷ 平日に発車がある停留所（病院の停留所を除く）。全国版と同じ分母です。比較は、回答があり停留所が10か所以上の453市区町村で行いました。

The list PDF was read as text with pdfplumber and checked against each prefecture's total row and the national total (2,740
districts, matching). Stops (../stops/NN.csv) were placed in municipalities using 1%-simplified 2021 boundaries from MLIT's
National Land Numerical Information (N03), via smartnews-smri/japan-topography; wards of designated cities roll up to the city,
and stops outside every boundary go to the nearest municipality within 5 km. A municipality's share is round-trip stops over
stops with a weekday departure (hospital stops excluded), the national edition's base. Comparisons use the 453 municipalities
that answered and have at least 10 analysed stops.

## 限界 / Limits

- 一覧は自己申告です。各自治体が独自に地区を決めていて、共通の距離や本数の基準はありません。停留所がまったくない地区も含まれ、停留所ごとの判定では見えません。
- 時刻表の判定は、病院名の停留所があるGTFSデータリポジトリのデータ（607件中394件）だけです。1,741市区町村のうち停留所があるのは618、10か所以上は453です。福井・京都・鳥取・島根・山口・愛媛の各府県は、全国版で停留所が分析されていません。
- 病院の停留所はデータごとに最大3か所です（上の「読み方」）。停留所は別の市町村のデータから来ることがあります。
- 境界は簡略化されているため、境界近くの停留所は隣の市町村に入ることがあります。
- 時点が違います: 一覧は2026-05-15時点、時刻表は2026-10-21（水）と2026-10-24（土）。
- 正式な「交通空白」の判断は自治体や運輸局が行うもので、この結果はその検討の材料です。自治体の判断の良し悪しを評価するものではありません。

The list is self-reported, with no common distance or frequency rule, and includes districts with no stop at all. The
timetable side covers only the 394 of 607 feeds with a hospital-named stop: 618 of the 1,741 municipalities have any analysed
stop and 453 have ten or more; no stops were analysed in Fukui, Kyoto, Tottori, Shimane, Yamaguchi or Ehime. At most three
hospital stops per feed (see above), and stops can come from another town's feed. Simplified boundaries can put a stop near a
border in the neighbouring municipality. The two sides are snapshots of different dates (list 2026-05-15, timetables 2026-10-21
and 2026-10-24). Official decisions on transport gaps are made by municipalities and MLIT's regional bureaus; this is input for
that work, not a judgement of any municipality's list.

## 出典とライセンス / Sources and licence

- 国土交通省「地域の足」交通空白の一覧（2026）: https://www.mlit.go.jp/sogoseisaku/transport/content/002005736.pdf （公共データ利用規約に基づき加工）
- 行政区域: 国土数値情報（行政区域データ N03、国土交通省）を smartnews-smri/japan-topography が簡略化したもの
- 時刻表: GTFSデータリポジトリ（https://gtfs-data.jp/ ）と各データの提供者（ライセンスは ../feeds.csv の license 列）
- この集計（CSV・JSON・本文）は CC BY 4.0、スクリプトは Apache-2.0。

Sources: MLIT's 2026 transport-gap list (PDF above, processed); municipal boundaries from MLIT's National Land Numerical
Information (N03), simplified by smartnews-smri/japan-topography; timetables from the GTFS Data Repository and each feed's
publisher (licences in ../feeds.csv). This output is CC BY 4.0; the script is Apache-2.0.

制作: MV2 of Munim, Inc.（mv2@munimtech.com）。MV2の名のもと、AIエージェントが作成しました。
Made by MV2 of Munim, Inc. with AI agents working in MV2's name.
