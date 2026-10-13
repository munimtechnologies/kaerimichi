# かえりみち / Kaerimichi

**バスで行って、その日のうちに帰ってこられる？**
**Can you get there by bus and come back the same day?**

Live app: https://munimv2.github.io/kaerimichi/

## なぜ / Why

地方では、車を運転しない高齢者や学生にとって、コミュニティバスや路線バスが通院・買い物・通学の足です。
でも「行きのバスはあるけど、帰りのバスがもう無い」ということがよくあります。時刻表を往復で突き合わせるのは大変です。

かえりみちは、出発の停留所と行き先（病院・駅・スーパーなど）を選ぶだけで、その日に
- 往復できるか
- 最も早く着ける時刻と、帰りの最終便
- 目的地に最大何時間いられるか
- 帰ってこられる最後の行き便

を表示します。直通便に加えて、**乗り換え1回まで**（乗り継ぎ5分以上）の経路も探します。
地図上の停留所は、その日の発車本数で色分けされるので、地域の「バスの空白」も一目でわかります。

In rural Japan, community and local buses are how people who don't drive get to the hospital, the shops and school.
Often there is a bus there but no bus back. Kaerimichi answers the round-trip question directly: pick a start stop and a
destination, and it shows whether a same-day round trip works, the earliest arrival, the last bus home, the longest
possible stay, and the last bus there that still gets you back. It searches direct trips and journeys with one transfer
(5 minutes minimum connection). Stops on the map are coloured by how many departures they have that day.

## データ / Data

- 全国の事業者が公開する [GTFSデータリポジトリ](https://gtfs-data.jp/) のGTFS / GTFS-JPデータ（約600件）を、ブラウザから直接読み込みます。
  一覧（`feeds.txt`）はリポジトリAPIのスナップショットで、zip本体はリポジトリから直接取得します。
- 手元のGTFS zipファイルを開くこともできます（世界中のGTFSに対応）。
- データの処理はすべてブラウザ内で行い、サーバーには何も送りません。
- 各データのライセンス（多くは CC BY 4.0）に従い、画面に出典と加工の旨を表示します。
- 地図: 地理院タイル（国土地理院）。

Feeds come from the GTFS Data Repository (Japan) or any GTFS zip you open. Everything runs in your browser; nothing is uploaded.
The feed list (`feeds.txt`) is a snapshot of the repository API, because that endpoint does not send CORS headers; the zip files do, so they are fetched live.

## しくみ / How it works

- `gtfs.js`: zip reader (DecompressionStream), CSV parser, `calendar.txt` + `calendar_dates.txt` service days,
  stop grouping (same `stop_name` within 400 m = one place, so the poles on both sides of a road count as one stop),
  direct trips, one-transfer journeys (Pareto-pruned by departure and arrival; a direct bus is never hidden behind a transfer),
  and the round-trip check.
- `app.js`: the map (Leaflet + GSI tiles), feed list, and results. Shareable URLs: `?feed=org/feed&date=YYYY-MM-DD&from=stop_id&to=stop_id&transfer=0&lang=en`.
- No build step and no server: open `index.html` from any static host.

## 注意 / Notes

時刻は公開GTFSデータの予定時刻です。予約制の便、ダイヤ改正、運休は各事業者の情報をご確認ください。乗り継ぎは同じデータ内の便だけを対象にしています。

## About

Made by MV2 of Munim, Inc. — contact: munimversion2@gmail.com.
This app was built by AI agents working in MV2's name. Questions about the app go to the address above, not to the transit operators.

License: MIT.
