# Findings: same-day hospital round trips by bus (2026-10-21, Saturday 2026-10-24)

Feeds analysed: 394 of 607 listed. Skipped: no_service 35, no_hospital_stop 118, discontinued 28, error 2, ended 27, flex_only 1, download_failed 2.
Stops with a departure on 2026-10-21 (hospital stops excluded): 53554.
Of these, 45007 (84.0%) can reach one of their feed's three busiest hospital-named stops and get back the same day with at least 30 minutes there (up to one transfer); on Saturday 33881 (63.3%).
Status totals (weekday): hub 868, ok 29252, okx 15755, noreturn 1255, oneway 1020, none 6272, idle 3343.
Per feed: median share 98.6%; 23 feeds below 50%; 3 at 0%; 97 feeds have round trips on the weekday but none on Saturday; 78 have no Saturday service at all.

## Lowest weekday shares (feeds with at least 20 stops)

| feed | prefecture | stops | round trip | share | Saturday | hospital stops | map |
|---|---|---|---|---|---|---|---|
| 朝日町「朝日町営バス」 | 山形県 | 48 | 0 | 0.0% | 50.0% | 町立病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=yamagata-asahitown%2FAsahiTown&date=2026-10-21&to=53_01&map=gap) |
| 八重瀬町「八重瀬町バス」 | 沖縄県 | 40 | 0 | 0.0% | 0.0% | （発）南部徳洲会病院／（着）南部徳洲会病院 | [open](https://munimv2.github.io/kaerimichi/?feed=yaesetown%2Fyaese-town-bus&date=2026-10-21&to=1_11_1&map=gap) |
| JR東日本盛岡支社「わんタク定時便」 | 青森県 | 43 | 1 | 2.3% | 2.3% | 外ヶ浜中央病院 | [open](https://munimv2.github.io/kaerimichi/?feed=jr-east-morioka%2FJReast_wandotaxi&date=2026-10-21&to=2_01&map=gap) |
| 太陽交通株式会社「太陽交通株式会社」 | 福岡県 | 166 | 14 | 8.4% | 4.2% | 鍵山医院／ひえだ診療所 | [open](https://munimv2.github.io/kaerimichi/?feed=taiyo-koutu%2Ftaiyo-koutu&date=2026-10-21&to=KYI_n&map=gap) |
| 名張市「名張市コミュニティバス」 | 三重県 | 139 | 12 | 8.6% | 0.0% | 市立病院／寺田病院 | [open](https://munimv2.github.io/kaerimichi/?feed=nabaricity%2Fcommunitybus&date=2026-10-21&to=130_01&map=gap) |
| 上越市「上越市市営バス」 | 新潟県 | 135 | 13 | 9.6% | 9.6% | 大島診療所前 | [open](https://munimv2.github.io/kaerimichi/?feed=joetsucity%2Fjoetsu&date=2026-10-21&to=2_14&map=gap) |
| 飯能市「飯能市乗合ワゴン　精明・加治」 | 埼玉県 | 40 | 6 | 15.0% | 0.0% | 飯能靖和病院 | [open](https://munimv2.github.io/kaerimichi/?feed=hannocity%2Fodekakemuma-seimei-kaji&date=2026-10-21&to=14_0&map=gap) |
| 神戸市「神戸市コミュニティバス」 | 兵庫県 | 86 | 16 | 18.6% | 0.0% | 神鋼記念病院／神戸平成病院／神戸労災病院北 | [open](https://munimv2.github.io/kaerimichi/?feed=kobecity%2Fkobe-shiokaze&date=2026-10-21&to=202_1&map=gap) |
| 鹿児島市「鹿児島市コミュニティバス「あいばす」」 | 鹿児島県 | 690 | 134 | 19.4% | 6.8% | 生協病院前方面／パールランド病院前／三州病院前方面 | [open](https://munimv2.github.io/kaerimichi/?feed=kagoshimacity%2Faibus&date=2026-10-21&to=700030_1&map=gap) |
| 四万十町「四万十町コミュニティバス」 | 高知県 | 82 | 17 | 20.7% | 0.0% | 診療所前／大奈路診療所 | [open](https://munimv2.github.io/kaerimichi/?feed=shimantotown%2FGTFS-Shimantotown_Bus&date=2026-10-21&to=8582_01&map=gap) |
| 弘前市「弘前市乗合タクシー（北星交通）」 | 青森県 | 113 | 24 | 21.2% | 21.2% | ESTクリニック前／健生病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=hirosakicity%2Fhokusei-noriai&date=2026-10-21&to=168_1&map=gap) |
| 新城市「新城市Ｓバス」 | 愛知県 | 146 | 31 | 21.2% | 13.7% | 新城市民病院／くまがい医院／診療所前 | [open](https://munimv2.github.io/kaerimichi/?feed=shinshirocity%2Fsbus&date=2026-10-21&to=110_01&map=gap) |
| 長野市「乗合タクシー（RT非対応）」 | 長野県 | 450 | 100 | 22.2% | 0.0% | 長野松代総合病院／鈴木医院／中屋診療所 | [open](https://munimv2.github.io/kaerimichi/?feed=naganocity%2Fnoriai&date=2026-10-21&to=205_01&map=gap) |
| 立川市「くるりんバス」 | 東京都 | 55 | 13 | 23.6% | 23.6% | 立川病院東／立川病院 | [open](https://munimv2.github.io/kaerimichi/?feed=tachikawacity%2Fkururinbus&date=2026-10-21&to=53_01&map=gap) |
| 伊賀市「伊賀市行政バス・コミュニティバス」 | 三重県 | 295 | 72 | 24.4% | 24.4% | 市民病院／病院下（イオンタウン伊賀上野前）／上野病院 | [open](https://munimv2.github.io/kaerimichi/?feed=igacity%2Fcommunitybus&date=2026-10-21&to=1011_01&map=gap) |
| 東濃鉄道「東濃鉄道（東鉄バス）可児営業所管内」 | 岐阜県 | 115 | 32 | 27.8% | 0.0% | 中部脳リハビリテーション病院／中部国際医療センター | [open](https://munimv2.github.io/kaerimichi/?feed=tohtetsu%2Ftohtetsu_kani&date=2026-10-21&to=903_01&map=gap) |
| 知多乗合（知多バス）「知多バス」 | 愛知県 | 168 | 47 | 28.0% | 28.0% | 一ノ草病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=chitabus%2Fchitabus&date=2026-10-21&to=021016_01&map=gap) |
| 流山市「流山ぐりーんバス」 | 千葉県 | 104 | 40 | 38.5% | 38.5% | 東部診療所前／おおたかの森病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=nagareyamacity%2Fnagareyamagreenbus&date=2026-10-21&to=41_01&map=gap) |
| 株式会社タケヤ交通「株式会社タケヤ交通」 | 宮城県 | 46 | 18 | 39.1% | 0.0% | 県南中核病院／川崎病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=takeyakoutu%2Ftakeyakotsu&date=2026-10-21&to=69_1&map=gap) |
| 新見市「新見市営バス」 | 岡山県 | 168 | 67 | 39.9% | 6.5% | 大佐診療所／メディカルクリニック／診療所前 | [open](https://munimv2.github.io/kaerimichi/?feed=niimicity%2Fniimishieibus&date=2026-10-21&to=116_01&map=gap) |
| 射水市「きときとバス」 | 富山県 | 236 | 101 | 42.8% | 25.4% | 市民病院／真生会富山病院前 | [open](https://munimv2.github.io/kaerimichi/?feed=imizucity%2Fimizushi&date=2026-10-21&to=51_01&map=gap) |
| 四万十市「四万十市営バス」 | 高知県 | 68 | 32 | 47.1% | 0.0% | 森下病院／市民病院／吉井病院・フジ中村店 | [open](https://munimv2.github.io/kaerimichi/?feed=shimantocity%2FGTFS-Shimantocity_Bus&date=2026-10-21&to=20104_01&map=gap) |
| 豊田市「豊田市　地域バス」 | 愛知県 | 250 | 129 | 51.6% | 22.0% | 甲村クリニック／足助病院 | [open](https://munimv2.github.io/kaerimichi/?feed=toyotacity%2Fchiikibus&date=2026-10-21&to=1509_05&map=gap) |
| 明石市「たこバス/たこバスミニ」 | 兵庫県 | 197 | 102 | 51.8% | 50.8% | 明石回生病院前／明石医療センター／明石回生病院南 | [open](https://munimv2.github.io/kaerimichi/?feed=akashicity%2Ftacobustacobusmini&date=2026-10-21&to=179_1&map=gap) |
| 津野町「津野町コミュニティバス「つのバス」」 | 高知県 | 78 | 41 | 52.6% | 0.0% | 姫野々診療所／診療所前 | [open](https://munimv2.github.io/kaerimichi/?feed=kochi-tsunotown%2FGTFS-Tsunotown_Bus&date=2026-10-21&to=21703_01&map=gap) |

## Largest weekday-to-Saturday drops (feeds with at least 20 stops)

| feed | prefecture | weekday | Saturday |
|---|---|---|---|
| 上士幌町「上士幌町コミュニティバス」 | 北海道 | 100.0% | 0.0% |
| 深浦町「深浦町コミュニティバス」 | 青森県 | 100.0% | 0.0% |
| 八戸市「八戸市南郷コミュニティバス」 | 青森県 | 100.0% | 0.0% |
| 階上町「階上町コミュニティバス」 | 青森県 | 100.0% | 0.0% |
| 鶴田町「鶴田町地域巡回バス」 | 青森県 | 100.0% | 0.0% |
| 南陽市「南陽市営バス」 | 山形県 | 100.0% | 0.0% |
| 太田市「太田市営バス」 | 群馬県 | 100.0% | 0.0% |
| さいたま市「西区指扇地区乗合タクシーあじさい号」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「岩槻区コミュニティバス」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「北区コミュニティバス」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「北区吉野町乗合タクシー宮原なかよし号」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「桜区大久保・中央区西与野地区乗合タクシーむさし号」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「西区コミュニティバス」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「岩槻区和土地区乗合タクシーレインボー号」 | 埼玉県 | 100.0% | 0.0% |
| さいたま市「桜区コミュニティバス」 | 埼玉県 | 100.0% | 0.0% |

## By prefecture

| prefecture | feeds | stops | weekday | Saturday |
|---|---|---|---|---|
| 北海道 | 4 | 321 | 93.1% | 82.9% |
| 青森県 | 21 | 2511 | 88.5% | 53.5% |
| 岩手県 | 3 | 787 | 96.3% | 51.2% |
| 宮城県 | 2 | 124 | 77.4% | 62.9% |
| 秋田県 | 2 | 451 | 97.1% | 72.1% |
| 山形県 | 27 | 3189 | 83.4% | 48.7% |
| 福島県 | 2 | 784 | 69.4% | 39.7% |
| 茨城県 | 5 | 628 | 92.2% | 78.5% |
| 栃木県 | 7 | 894 | 87.6% | 78.3% |
| 群馬県 | 4 | 436 | 93.1% | 67.0% |
| 埼玉県 | 12 | 575 | 93.7% | 48.9% |
| 千葉県 | 8 | 967 | 76.7% | 69.4% |
| 東京都 | 5 | 214 | 78.0% | 74.8% |
| 神奈川県 | 2 | 159 | 98.7% | 93.1% |
| 新潟県 | 5 | 813 | 80.6% | 68.0% |
| 富山県 | 19 | 2797 | 88.4% | 52.9% |
| 石川県 | 6 | 589 | 90.8% | 89.5% |
| 山梨県 | 2 | 219 | 95.0% | 40.2% |
| 長野県 | 32 | 4393 | 82.6% | 47.5% |
| 岐阜県 | 29 | 4743 | 79.9% | 56.5% |
| 静岡県 | 6 | 644 | 78.4% | 69.4% |
| 愛知県 | 28 | 3182 | 85.0% | 75.0% |
| 三重県 | 29 | 4973 | 84.2% | 70.0% |
| 滋賀県 | 9 | 1377 | 85.8% | 73.8% |
| 兵庫県 | 23 | 2315 | 83.3% | 42.7% |
| 奈良県 | 2 | 111 | 96.4% | 53.2% |
| 和歌山県 | 8 | 1206 | 91.5% | 83.2% |
| 岡山県 | 8 | 1019 | 87.5% | 52.9% |
| 徳島県 | 11 | 1816 | 91.8% | 90.6% |
| 香川県 | 5 | 759 | 98.8% | 93.9% |
| 高知県 | 26 | 3264 | 89.6% | 79.1% |
| 福岡県 | 28 | 2236 | 90.1% | 76.0% |
| 佐賀県 | 1 | 52 | 100.0% | 94.2% |
| 長崎県 | 1 | 105 | 66.7% | 45.7% |
| 熊本県 | 5 | 3947 | 73.4% | 68.4% |
| 大分県 | 4 | 170 | 94.7% | 26.5% |
| 鹿児島県 | 1 | 690 | 19.4% | 6.8% |
| 沖縄県 | 2 | 94 | 46.8% | 0.0% |
