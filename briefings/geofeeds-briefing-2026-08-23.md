# GeoFeeds Daily Briefing — Sunday, August 23, 2026

*Covering posts from 0800 ET August 22 to 0800 ET August 23. Sources: 165 geospatial feeds.*

---

Quiet day across the feeds — here are the highlights.

## Highlights

**1. PostGIS Tiger Geocoder Splits Fully from Core** — *PostGIS*
The PostGIS project confirms `postgis_tiger_geocoder` has completed its move out of PostGIS core: the 3.6 series is the last to bundle it, 3.7 ships without it, and the extension now lives in its own dedicated OSGeo Gitea repo, requiring PostgreSQL 16+. Small release note, but it marks a real infrastructure decoupling as done rather than pending — worth a bookmark for anyone running Census TIGER geocoding on Postgres.
→ [PostGIS Tiger Geocoder 2025.2](https://postgis.net/2026/08/PostGIS-Tiger-Geocoder-2025.2/)

**2. A Belated Workshop Recap, Worth the Wait** — *Robin's Blog*
Robin Wilson finally writes up his FOSS4G UK 2025 workshop on serving live vector tiles straight from PostGIS with pg_tileserv — comparing on-the-fly generation against pre-tiled pipelines — while noting his FOSS4G UK 2026 talk (Leeds, October) has just been accepted. Independent, hands-on, and one of the few sources in the feeds actually walking through PostGIS tile-serving tradeoffs rather than just naming the tools.
→ [Some recent, and not so recent, talks and activities](https://blog.rtwilson.com/some-recent-and-not-so-recent-talks-and-activities/)

**3. Ground-Level View of the Colombia Earthquake Response** — *Earth Observation on Medium*
An independent Medium post walks through how geospatial and EO tools supported the response to the M7.4 earthquake that struck western Colombia near San José del Palmar on August 10. One of the only applied disaster-response pieces to surface in this window, and a rare demand-side view of EO in active use rather than in a vendor pitch.
→ [Geospatial Response to Colombia's 2026 Quake](https://medium.com/%40himal.sudasingha/geospatial-response-to-colombias-2026-quake-f4e3df7ca56e?source=rss------earth_observation-5)

---

*Also crossing the feeds but too thin to merit a full entry: an Esri ArcGIS Hub post behind a password wall, two lighthearted Mappery posts (an 8th-anniversary note and a novelty "Peas on Earth" pin), and a short Trimble Geospatial promo video on SLAM-to-CAD workflows.*
