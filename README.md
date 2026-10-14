# かえりみち / Kaerimichi

**バスで行って、その日のうちに帰ってこられる？**
**Can you get there by bus and come back the same day?**

Live app: https://munimv2.github.io/kaerimichi/

## なぜ / Why

地方では、車を運転しない高齢者や学生にとって、コミュニティバスや路線バスが通院・買い物・通学の足です。
でも「行きのバスはあるけど、帰りのバスがもう無い」ということがよくあります。時刻表を往復で突き合わせるのは大変です。
国土交通省も「交通空白」の解消を重点課題としています（[「交通空白」解消に向けた取組方針2026](https://www.mlit.go.jp/sogoseisaku/transport/content/002005758.pdf)）。

かえりみちは、出発の停留所と行き先（病院・駅・スーパーなど）を選ぶだけで、その日に
- 往復できるか
- 最も早く着ける時刻と、帰りの最終便
- 目的地に最大何時間いられるか
- 帰ってこられる最後の行き便

を表示します。直通便に加えて、**乗り換え1回まで**（乗り継ぎ5分以上）の経路も探します。

### 交通空白マップ（v0.3）

「地図の色」で「行き先へ日帰りで往復できるか」を選ぶと、**すべての停留所**を、選んだ行き先（病院・駅など）へ行ってその日のうちに帰ってこられるかで色分けします。

| 色 | 意味 |
|---|---|
| 濃い緑 | 往復できる（直通） |
| 薄い緑 | 往復できる（乗り換えあり） |
| オレンジ | 行けるが、帰りの最終に間に合わない |
| 赤 | 行けるが、帰りの便がない |
| 紫 | 行けない（便なし・乗り換え2回以上） |
| 灰色 | この日は発車なし |

区分ごとの停留所数を表示し、停留所ごとの判定（最も早い到着、帰りの最終、最大滞在時間）を**CSVでダウンロード**できます。自治体の交通担当者が、路線やダイヤの見直しで「どの地域から病院へ日帰りできないか」を確かめる用途を想定しています。

In rural Japan, community and local buses are how people who don't drive get to the hospital, the shops and school.
Often there is a bus there but no bus back. Kaerimichi answers the round-trip question directly: pick a start stop and a
destination, and it shows whether a same-day round trip works, the earliest arrival, the last bus home, the longest
possible stay, and the last bus there that still gets you back. It searches direct trips and journeys with one transfer
(5 minutes minimum connection).

**Service-gap map (v0.3):** switch "Map colours" to "Same-day round trip to the destination" and every stop is coloured by
whether you can get from it to the chosen destination and back that day (direct, with a transfer, can't get back in time,
no bus back, can't get there, no departures). The legend counts stops per class, and a CSV gives the verdict, earliest
arrival, last bus back and longest stay for every stop, for route reviews and service-gap planning.

## データ / Data

- 全国の事業者が公開する [GTFSデータリポジトリ](https://gtfs-data.jp/) のGTFS / GTFS-JPデータ（約600件）を、ブラウザから直接読み込みます。
  一覧（`feeds.txt`）はリポジトリAPIのスナップショットで、zip本体はリポジトリから直接取得します。
- 手元のGTFS zipファイルを開くこともできます（世界中のGTFSに対応）。
- データの処理はすべてブラウザ内で行い、サーバーには何も送りません。
- 各データのライセンス（多くは CC BY 4.0）に従い、画面に出典と加工の旨を表示します。CSVを使うときも出典を表示してください。
- 地図: 地理院タイル（国土地理院）。

Feeds come from the GTFS Data Repository (Japan) or any GTFS zip you open. Everything runs in your browser; nothing is uploaded.
The feed list (`feeds.txt`) is a snapshot of the repository API, because that endpoint does not send CORS headers; the zip files do, so they are fetched live.

## しくみ / How it works

- `gtfs.js`: zip reader (DecompressionStream), CSV parser, `calendar.txt` + `calendar_dates.txt` service days,
  stop grouping (same `stop_name` within 400 m = one place, so the poles on both sides of a road count as one stop),
  direct trips, one-transfer journeys (Pareto-pruned by departure and arrival; a direct bus is never hidden behind a transfer),
  the round-trip check, and `serviceGaps()`: journeys from every stop to one destination and back in a single pass
  (direct legs from the destination's trips, then one change at any stop that has a direct bus), so the whole map is coloured at once.
- `app.js`: the map (Leaflet + GSI tiles), feed list, results, service-gap legend and CSV.
  Shareable URLs: `?feed=org/feed&date=YYYY-MM-DD&from=stop_id&to=stop_id&transfer=0&map=gap&lang=en`.
- No build step and no server: open `index.html` from any static host.
- Tests: `python test_kaerimichi.py` checks the wiring, and with Node.js installed runs `test_gtfs.mjs` (a small made-up network
  with a known answer for every kind of stop).

## 注意 / Notes

時刻は公開GTFSデータの予定時刻です。予約制の便、ダイヤ改正、運休は各事業者の情報をご確認ください。乗り継ぎは同じデータ内の便だけを対象にしています。

## About

Made by MV2 of Munim, Inc. — contact: munimversion2@gmail.com.
This app was built by AI agents working in MV2's name. Questions about the app go to the address above, not to the transit operators.

License: MIT.
