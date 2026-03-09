# GeoFeeds Daily Briefing — Monday, March 9, 2026

*Covering posts from 0800 ET March 8 to 0800 ET March 9, 2026. Sources: 113 geospatial feeds.*

---

## Three Topics That Stood Out

**1. GeoParquet-io Hits 1.0**

Chris Holmes announced the 1.0 milestone of geoparquet-io, a CLI/Python tool he describes as his go-to for working with GeoParquet and "any vector data." The tool addresses a specific gap that's long existed in the cloud-native geo stack: spatial partitioning across large datasets. It now supports partitioning by H3, S2, QuadKey, KD-Tree, and A5, and can automatically pull Overture and GAUL boundaries for admin-partitioned outputs. The announcement cross-posts to cloudnativegeo.org, which is where the associated Best Practices guide lives.

*Why this matters:* Cloud-native geo infrastructure has been philosophically rich but tooling-poor. A stable 1.0 CLI from the person who co-authored the GeoParquet spec — and who now has a single tool that enforces best practices by default — closes a real gap. This is infrastructure becoming usable.

---

**2. EarthDaily's EDC-01 Posts First Light**

Spatial Source reports that EarthDaily has released first high-resolution images from its EDC-01 satellite, whose cameras can digitize more than 20 billion pixels per second. The imagery covers areas including Perth, Australia. EDC-01 is EarthDaily's commercial constellation entry, and first-image releases are the industry's standard proof-of-life milestone for new hardware.

*Why this matters:* The commercial EO constellation market continues filling in. EDC-01 adds another high-resolution option to a market segment growing in both supply and competition. Whether EarthDaily differentiates on analytics pipeline — the dominant EO business narrative — or just imagery throughput will be the real story to watch.

---

**3. Open Geospatial as Public Good**

GoGeomatics published a reflection by David Legris on the GlobalBuildingAtlas and the broader concept of the digital commons — prompted by his own dependence on free tools like QGIS and free datasets in daily practice. The piece frames open geospatial resources as a collective infrastructure that practitioners draw on constantly but rarely think of as a commons requiring stewardship. The GlobalBuildingAtlas is offered as a specific example of that commons in action.

*Why this matters:* With DOGE-era budget cuts threatening U.S. open data programs in the background, and the OGC/Overture GERS governance debate active earlier this week, the question of who maintains open geospatial infrastructure — and who gets to define its standards — is live. This framing from Canada is a quieter version of the same conversation.

---

## Top Four Posts

*Note: Weekend window (0800 ET Sat–Sun). Substantive post volume was low; four posts merit selection over five.*

---

**1. Officially Announcing Geoparquet-io: a CLI/Python Tool for GeoParquet** — *Stories by Chris Holmes on Medium*
The 1.0 announcement of a tool that Holmes has been building alongside the GeoParquet Best Practices guide. The practical detail here is what makes it worth reading: H3/S2/QuadKey/KD-Tree/A5 partitioning out of the box, Overture/GAUL boundary integration for admin partitioning, and a clear statement that this is now Holmes's primary tool for all vector data work. That's a meaningful personal endorsement from the spec author.
→ [Read on Medium](https://cholmes.medium.com/officially-announcing-geoparquet-io-a-cli-python-tool-for-geoparquet-08a40b47e1fc?source=rss-e27f6e2373d3------2)

---

**2. GlobalBuildingAtlas and the Digital Commons** — *GoGeomatics*
David Legris uses the GlobalBuildingAtlas as a lens to examine the broader open geospatial commons — QGIS, open datasets, shared knowledge infrastructure — that practitioners depend on daily without much reflection. The framing matters: it's not a product announcement, it's a question about collective stewardship. Rare to see this kind of structural thinking on GoGeomatics, which more often runs conference promos.
→ [Read on GoGeomatics](https://gogeomatics.ca/globalbuildingatlas-and-the-digital-commons/)

---

**3. EarthDaily Releases First High-Resolution Images** — *Spatial Source*
EDC-01's first-light release from EarthDaily, with 20 billion pixels/second camera throughput cited as the headline spec. Spatial Source is the Australian trade outlet for this beat, and this is a straight news report on a real hardware milestone. Worth a read if you're tracking commercial constellation build-out.
→ [Read on Spatial Source](https://www.spatialsource.com.au/earthdaily-releases-first-high%e2%80%91resolution-images/)

---

**4. Digital Twins Key to Construction Sector Success** — *Spatial Source*
A trade-press trend piece arguing that construction's defining shift in 2026 is from static BIM models to AI-integrated digital twins. The piece is supply-side and Australian-market focused, but it's notable as a rare instance of a commercial vertical (construction) getting a substantive treatment rather than just a government or developer-audience frame. The transition narrative — static model to live twin — is exactly the kind of applied digital twin story that usually goes uncovered in this ecosystem.
→ [Read on Spatial Source](https://www.spatialsource.com.au/ai-digital-twins-the-key-to-construction-sector/)
