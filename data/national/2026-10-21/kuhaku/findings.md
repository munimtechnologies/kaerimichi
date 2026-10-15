# MLIT 交通空白 list (2026) vs timetable round trips: findings

- List rows parsed: 1741 municipalities (1705 answered); districts 2740 (MLIT total 2740); municipalities with ≥1 district: 892.
- Stops assigned to a municipality: 57621 inside a boundary, 143 by nearest boundary (≤5 km), 1 unassigned.
- Municipalities with at least 10 analysed stops: 453 (254 listed a 交通空白 district, 199 did not).
- Weekday share, median: listed 95.9% vs not listed 98.3%; mean 81.7% vs 85.7%; Mann-Whitney p = 0.024683957635343926; P(listed lower) = 0.56.
- Saturday share, median: listed 71.8% vs not listed 85.0%; p = 0.03864868276916772.
- Spearman(share, districts) = -0.06711708302499128; Spearman(share, gap population) = -0.08511232365576066.
- Prefecture level (47): Spearman(share, districts) = -0.21663326964225035.

## Low timetable share (< 50%) but no listed or monitored district (12)

- 山形県 朝日町: 0.0% of 58 stops (Sat 37.9%); feeds yamagata-asahitown/AsahiTown／yamakobus/YAMAKOBUS
- 福岡県 みやこ町: 0.0% of 30 stops (Sat 10.0%); feeds taiyo-koutu/taiyo-koutu
- 熊本県 錦町: 0.0% of 34 stops (Sat 0.0%); feeds sankobus/sankobus
- 熊本県 五木村: 0.0% of 14 stops (Sat 0.0%); feeds sankobus/sankobus
- 山形県 大石田町: 9.1% of 11 stops (Sat 9.1%); feeds obanazawacity/ObanazawaCity／yamakobus/YAMAKOBUS
- 熊本県 水俣市: 13.2% of 189 stops (Sat 13.2%); feeds sankobus/sankobus
- 愛知県 大府市: 13.8% of 29 stops (Sat 13.8%); feeds chitabus/chitabus／higashiuratown/communitybus／tokaicity/tokai-ranranbus
- 福島県 富岡町: 16.7% of 24 stops (Sat 0.0%); feeds shinjobankotsu/SHINJOBANKOTSU
- 滋賀県 大津市: 16.7% of 12 stops (Sat 16.7%); feeds kokacity/sinaicommunitybus／takashimacity/takasimasicommunitybus
- 高知県 大川村: 17.2% of 29 stops (Sat 17.2%); feeds reihoku-kanko/GTFS-Reihokukanko_Localbus
- 青森県 今別町: 18.8% of 16 stops (Sat 0.0%); feeds jr-east-morioka/JReast_wandotaxi／sotogahamatown/sotogahama-townbus
- 熊本県 荒尾市: 20.2% of 119 stops (Sat 20.2%); feeds sankobus/sankobus

## Listed 交通空白 districts while ≥95% of analysed stops allow the round trip (136)

- 岐阜県 美濃加茂市: 44 districts (7k people); 100.0% of 213 stops
- 福岡県 直方市: 18 districts (9k people); 97.0% of 99 stops
- 和歌山県 那智勝浦町: 13 districts (1k people); 100.0% of 26 stops
- 青森県 東通村: 12 districts (4k people); 100.0% of 37 stops
- 三重県 いなべ市: 11 districts (44k people); 99.6% of 261 stops
- 北海道 共和町: 10 districts (5k people); 100.0% of 11 stops
- 新潟県 糸魚川市: 10 districts (4k people); 99.7% of 294 stops
- 高知県 仁淀川町: 10 districts (1k people); 100.0% of 33 stops
- 熊本県 御船町: 9 districts (17k people); 100.0% of 46 stops
- 岩手県 一関市: 8 districts (103k people); 98.8% of 421 stops
- 秋田県 にかほ市: 8 districts (21k people); 100.0% of 38 stops
- 長野県 阿智村: 8 districts (6k people); 97.3% of 112 stops
- 長野県 山形村: 8 districts (1k people); 100.0% of 22 stops
- 香川県 善通寺市: 8 districts (29k people); 100.0% of 11 stops
- 熊本県 天草市: 8 districts (7k people); 100.0% of 388 stops
- 富山県 滑川市: 7 districts (24k people); 100.0% of 163 stops
- 奈良県 奈良市: 7 districts (10k people); 100.0% of 15 stops
- 香川県 三豊市: 7 districts (60k people); 99.0% of 296 stops
- 福岡県 朝倉市: 7 districts (49k people); 100.0% of 24 stops
- 秋田県 秋田市: 6 districts (56k people); 100.0% of 25 stops
- 広島県 福山市: 6 districts (36k people); 100.0% of 51 stops
- 福岡県 北九州市: 6 districts (131k people); 100.0% of 125 stops
- 茨城県 土浦市: 5 districts (23k people); 100.0% of 52 stops
- 石川県 内灘町: 5 districts (5k people); 100.0% of 73 stops
- 愛知県 岡崎市: 5 districts (113k people); 100.0% of 40 stops
- 愛知県 南知多町: 5 districts (10k people); 100.0% of 55 stops
- 徳島県 那賀町: 5 districts (7k people); 100.0% of 95 stops
- 徳島県 海陽町: 5 districts (7k people); 100.0% of 96 stops
- 高知県 南国市: 5 districts (9k people); 99.4% of 161 stops
- 高知県 佐川町: 5 districts (3k people); 100.0% of 90 stops
- 熊本県 合志市: 5 districts (65k people); 98.8% of 80 stops
- 北海道 石狩市: 4 districts (2k people); 98.5% of 65 stops
- 青森県 野辺地町: 4 districts (11k people); 95.5% of 67 stops
- 山梨県 北杜市: 4 districts (45k people); 97.9% of 194 stops
- 三重県 御浜町: 4 districts (5k people); 100.0% of 53 stops
- 三重県 紀宝町: 4 districts (0k people); 99.2% of 127 stops
- 兵庫県 西宮市: 4 districts (5k people); 100.0% of 51 stops
- 兵庫県 加西市: 4 districts (9k people); 100.0% of 134 stops
- 兵庫県 市川町: 4 districts (9k people); 100.0% of 65 stops
- 徳島県 小松島市: 4 districts (3k people); 100.0% of 85 stops

## Limits

- The list is self-reported: each municipality drew its own districts with no common distance or frequency rule, and they include places with no stop at all, which a stop-based measure cannot see.
- The timetable measure covers only feeds in the GTFS Data Repository with a hospital-named stop (394 of 607), so many municipalities have few or no analysed stops; a municipality's stops can come from another town's feed.
- Stops are placed in municipalities with simplified (1%) 2021 boundaries (smartnews-smri/japan-topography, from MLIT 国土数値情報 N03); stops near a border can land in the neighbour.
- Both are snapshots: the list was compiled 2026-05-15, the timetables are for 2026-10-21 and 2026-10-24.
