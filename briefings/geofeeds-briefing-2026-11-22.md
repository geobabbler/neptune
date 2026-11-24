# GeoFeeds Daily Briefing — Sunday, November 22, 2026

*Covering posts from 0800 ET November 21 to 0800 ET November 22. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Free Infrastructure Meets the Machine Crowd**

This week's weeklyOSM reads like a stress report. Sarah Hoffmann suggested that shutting down OpenStreetMap's critical services, including Overpass, Nominatim, Photon, the tile servers, OSRM, Valhalla, the OSM API and Geofabrik's extracts, may be the only way to force a public conversation about who sustains them. AI scrapers, autonomous agents and AI-generated apps are piling load onto those servers and the people who run them. Jochen Topf asked whether he should drop Taginfo's Projects feature because listing requests now look machine-made. London mappers say uMap users keep getting blocked as spammers, and Brazilian mappers report inexperienced editors breaking boundaries, waterways and power-pole data. David G. Smith found a parallel in DuckDB 2.0.1 LTS, a release built around correctness, security and data-loss fixes, including one where rows with NULL values could be missed in databases created by older versions.

*Why this matters:* Open data's orthodoxy assumed volunteers could absorb any load. Agents break that assumption, and Hoffmann's threat makes the open data debate concrete. It's the same lesson as last week's Java4Shell scramble. The tools everyone builds on are only as sturdy as the people maintaining them.

**2. Base Maps, Borders and Who Draws Them**

Swisstopo released its first SWISSIMAGE true orthophotos, starting with the canton of Geneva, Spatialists reported. Buildings no longer lean, and a near-infrared band now ships alongside RGB, so the separate SWISSIMAGE RS product is being retired. weeklyOSM flagged a bigger sovereignty move. Reuters reports South Korea will soon lift its two-decade restriction on exporting high-precision map data to overseas servers, letting Google Maps work properly there. The conditions include blurring military and sensitive facilities and restricting coordinates, and local giants Naver and Kakao stand to lose ground. At GeoCurrents, Martin W. Lewis started a two-part look at what "Tibet" even means. Xizang, the Tibet Autonomous Region, covers less than half the plateau, which spans six Chinese province-level divisions plus Ladakh, Nepal's Mustang District and, by some definitions, Baltistan. Arunachal Pradesh, which China claims as "South Tibet," sits south of the Himalayan crest entirely.

*Why this matters:* Sovereignty usually shows up in these feeds as defense contracts. Korea's decision is the procurement-phase version applied to base maps, trading national control for platform access with strings attached. Swisstopo's NIR band is the quieter counterpoint, a national agency making its own imagery more analytically useful.

**3. One Copy, Many Engines**

David G. Smith walked through a Google Cloud demo, written up by KDnuggets, where Spark, Trino and BigQuery all work on a single Apache Iceberg table in Cloud Storage. Spark creates and loads the table, Trino appends and BigQuery runs updates and merges, with no sync pipeline in between. The interesting part is the collision test. Under serializable isolation, a Trino insert commits and a long-running Spark MERGE aborts rather than corrupt anything. Under snapshot isolation both succeed, but the merge misses the new rows. The same one-copy idea is showing up in geo, often in the browser. Open Geospatial Solutions' seventh NGIS 2026 workshop video shares GeoLibre maps as links pointing at project files on Source Cooperative, as embedded viewers or as standalone HTML exports. weeklyOSM noted Bypass Web, which runs Overpass QL queries entirely in the browser against locally stored Open Planet Data.

*Why this matters:* This is cloud-native geo's core bet, one copy of the data in object storage with swappable engines on top. GeoParquet and STAC got the format layer moving. Coordinated writes and isolation levels are the next gap, and geo teams have barely started that conversation.

---

## Top Five Posts

**1. weeklyOSM 852** — *weeklyOSM*
Sarah Hoffmann's suggestion that OSM might have to switch off Overpass, Nominatim and the tile servers to get anyone's attention is the headline, and the thread is worth reading in full. The issue also covers HeiGIT's updated ohsome Country Quality Report across 27 countries, South Korea's map export decision and State of the Map 2027 in Bogotá, the first in South America.
→ [weeklyOSM 852](https://weeklyosm.eu/archives/0852/)

**2. The End of Data Copies? What a Google Cloud Iceberg Demo Reveals About the Future of Analytics** — *Thoughts & Insights — David G. Smith*
A clear walkthrough of what Iceberg's optimistic concurrency actually does when two engines write at once, with the serializable and snapshot outcomes laid out side by side. Smith also lists the caveats, like long-running writes repeatedly losing conflicts to fast appends, which keeps it from reading like a pitch.
→ [The End of Data Copies? What a Google Cloud Iceberg Demo Reveals About the Future of Analytics](https://davidgsmith.net/thoughts/the-end-of-data-copies-what-a-google-cloud-iceberg-demo-reveals-about-the-future-of-analytics.html)

**3. Mapping “Tibet,” a Geographically Ambiguous Term** — *GeoCurrents*
Four maps and a tight argument about how one place name covers very different polygons, from the Tibet Autonomous Region to the whole plateau. It's a good reminder that the boundary you pick decides the answer, and a follow-up on the cultural definition is coming next.
→ [Mapping “Tibet,” a Geographically Ambiguous Term](https://www.geocurrents.info/blog/2026/11/21/mapping-tibet-a-geographically-ambiguous-term/)

**4. First SWISSIMAGE true orthophotos** — *Spatialists – geospatial news*
Short, but it records a real change to one of Europe's best-known national imagery products. True orthophotos remove building lean, and folding near-infrared into the standard product means Swiss users get vegetation analysis without a separate dataset.
→ [First SWISSIMAGE true orthophotos](https://spatialists.ch/posts/2026/11/21-first-swissimage-true-orthophotos/)

**5. Story Maps, Dashboards, and Sharing: Communicating and Collaborating | NGIS 2026 Workshop (7/8)** — *Open Geospatial Solutions*
Dr. Qiusheng Wu's session turns an earthquake project into a cross-filtering dashboard and a three-chapter story map, then runs through every way to share a GeoLibre map. It's hands-on, browser-based and free, the kind of practical tutorial the ecosystem keeps saying it lacks.
→ [Story Maps, Dashboards, and Sharing: Communicating and Collaborating | NGIS 2026 Workshop (7/8)](https://www.youtube.com/watch?v=rVaRo-4T1qg)
