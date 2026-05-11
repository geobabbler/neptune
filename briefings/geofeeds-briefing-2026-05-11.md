# GeoFeeds Daily Briefing — Monday, May 11, 2026

*Covering posts from 0800 ET May 10 to 0800 ET May 11. Sources: 160 geospatial feeds.*

---

## Three Topics That Stood Out

**1. GDAL v3.13.0 "Iowa City" Ships**

On Friday, May 8, GDAL maintainer Even Rouault announced version 3.13.0 of the Geospatial Data Abstraction Library via the project mailing list. The release, nicknamed "Iowa City," was flagged by #geoObserver, the German-language open-source radar that reliably catches these drops before the English-language outlets do. The headline additions are new `gdal vector` CLI subcommands — `combine`, `concave-hull`, `convex-hull`, `dissolve`, and `check` — that materially expand what practitioners can do without scripting. Given that GDAL is also a core dependency of QGIS 4.0 (released in March), this release lands into an already-active open-source update cycle.

*Why this matters:* GDAL is the invisible substrate under most geospatial work. New vector CLI commands reduce the gap between "I know what I want" and "I can automate it without writing Python." For practitioners leaning into scripted workflows, this is the release that closes several common workaround loops.

---

**2. Maps as Living Systems: TomTom and MapTiler Signal a Shift**

Two product-oriented posts on the same day pointed in the same direction. Geospatial World published a video interview with TomTom VP of Product Management Mike Gilbert, who frames maps as having evolved into "living spatial intelligence systems" — continuously updated, AI-powered, and designed from the ground up for autonomous vehicle decision-making. On the same day, MapTiler shipped its May update, leading with interactive 3D model improvements to its SDK and a new Japan base map built to Japanese cartographic conventions rather than adapted from Western defaults.

*Why this matters:* The competitive front in base mapping has moved well past coverage. Real-time intelligence pipelines, cultural cartographic precision, and 3D interactivity are now table stakes for serious mapping platforms. TomTom and MapTiler are making different bets on what "living" means, and neither framing is wrong.

---

**3. African Geospatial Infrastructure, From the Inside**

Geospatial FM's latest episode — the clearest standout of the day — is a two-part conversation with Abdulfatai Sanusi, a geospatial developer who walked through an MS Azure to Esri Enterprise migration at a Nigerian power utility spanning several states, then described his move to Proforce Galaxies, a local EO satellite design and data pipeline company with its own mobile data collection software. This is operational applied GIS in an African utility context — not Western vendors describing what they're selling into Africa, but a practitioner describing what they built, what broke, and what they're building next.

*Why this matters:* The feed ecosystem has a persistent blind spot on non-Western operational geospatial work (see landscape context). Proforce Galaxies — designing EO satellites while building their own field data toolchain — represents a class of organization that almost never appears in the feeds. This episode is the exception.

---

## Top Five Posts

**1. GDAL Released: v3.13.0 „Iowa City"** — *#geoObserver*
The most consequential infrastructure news of the day, caught early by the most reliable German-language FOSS4G radar. The description excerpt covers the CLI additions in specific technical detail — `concave-hull` and `dissolve` alone address years of forum workarounds. Written in German, but the release notes are in English and the geoObserver post links directly to the GDAL documentation.
→ [geoobserver.de](https://geoobserver.de/2026/05/11/gdal-released-v3-13-0-iowa-city/)

**2. GIS at a Nigerian Power Utility and Earth Observation at Proforce Galaxies** — *Geospatial FM*
Abdulfatai Sanusi describes a cloud platform migration at a multi-state Nigerian power utility — the kind of enterprise GIS implementation that never gets documented anywhere — and then pivots to Proforce Galaxies' satellite design and data pipeline work. The clips embedded in the feed summary cover as-built documentation lag, the case against raw EO data as a product, and when geospatial wins versus when it doesn't. Dense with operational specificity.
→ [geospatial.fm](https://www.geospatial.fm/p/gis-at-a-nigerian-power-utility-and)

**3. The Future of Autonomous Driving Runs on Living Maps** — *Geospatial World*
Mike Gilbert's framing of maps as "living spatial intelligence systems" is more than product messaging — it describes a genuine architectural shift in how TomTom positions its mapping platform relative to static HD map competitors. The interview touches AI-powered mapping, open geospatial collaboration, and scalable infrastructure. Worth watching for anyone tracking the autonomous vehicle map market.
→ [geospatialworld.net](https://geospatialworld.net/videos/the-future-of-autonomous-driving-runs-on-living-maps/)

**4. May Updates: Interactive 3D Models and a New Map of Japan** — *MapTiler News*
The Japan map is the more interesting item here: a clean, modern base map built to Japanese cartographic conventions rather than a localized version of a Western-default design. The 3D model interactivity improvements are SDK-level, not cosmetic. Both signal that MapTiler is iterating on quality and cultural fidelity, not just coverage.
→ [maptiler.com](https://www.maptiler.com/news/2026/05/may-updates-interactive-3d-models-and-a-new-map-of-japan)

**5. Top Innovation: An Impactful Decade for Geomatics Tech** — *GoGeomatics*
The GoGeomatics high-volume discount applies here, but the framing earns its place: "the coolest new gear is often just the visible fruit of deeper innovation." The piece takes a supply-chain view of geomatics advancement — crediting background infrastructure and process shifts rather than flashy hardware cycles. A useful counterweight to the product-announcement noise, even if it doesn't go deep on specifics.
→ [gogeomatics.ca](https://gogeomatics.ca/top-innovation-an-impactful-decade-for-geomatics-tech/)
