# GeoFeeds Daily Briefing — Wednesday, May 20, 2026

*Covering posts from 0800 ET Wednesday, May 20 to 0800 ET Thursday, May 21, 2026. Sources: 161 geospatial feeds.*

---

## Three Topics That Stood Out

**1. GPS Independence Moves from Talking Point to Budget Line**

Three separate stories from the day's feeds converge on the same signal: funded, concrete alternatives to GPS are no longer theoretical. TrustPoint secured a $4 million TACFI contract from SpaceWERX to demonstrate a full end-to-end GPS-independent PNT system — four satellites, four ground stations, live trilateration, and a software-defined architecture designed to adapt in contested environments. The system uses C-band rather than GPS's L-band, a deliberate choice for interference resistance. Separately, ArkEdge Space delivered a feasibility study to JAXA on a GNSS-independent LEO positioning, navigation, and timing system. And the Danish maritime authority (DNK) launched a program offering ship operators protection against the GNSS interference that has spiked in the Baltic and beyond.

*Why this matters:* GNSS vulnerability has been discussed for years, but funding lagged. Three actors moving from analysis to demonstration and operational programs in a single day's coverage — across defense, space agency research, and maritime sectors — suggests the investment phase for GPS-independent PNT has genuinely arrived. The TrustPoint CEO's framing is telling: "resilient navigation does not require billion-dollar constellations."

---

**2. OGC Formalizes JSON-FG, Closing GeoJSON's Biggest Gaps**

The Open Geospatial Consortium officially published the Features and Geometries JSON (JSON-FG) standard — the culmination of a Standards Working Group process that has been active since 2021. The standard extends GeoJSON with four capabilities that have long frustrated practitioners: coordinate reference systems beyond WGS 84 (the notorious longitude-latitude-only lock), temporal properties, 3D solid and prism geometry types, and feature type and schema declarations. Critically, JSON-FG is designed as a strict superset of GeoJSON: valid JSON-FG is valid GeoJSON, meaning existing tooling doesn't break.

*Why this matters:* GeoJSON's WGS84-only constraint has been a persistent blocker for engineering, cadastral, and 3D urban modeling workflows that operate in projected or local CRS. JSON-FG removes that friction without forking the ecosystem. GDAL already ships a driver; wide adoption now depends on uptake in OGC API – Features implementations and downstream toolchains.

---

**3. EO Makes the Humanitarian Case**

EarthDaily's "Food Security in Flux" is the kind of post that rarely appears in the feeds: a demand-side argument for Earth observation grounded in hard numbers. Global ODA fell 23.1% in 2025 — the largest single-year contraction on record — with humanitarian assistance down 35.8% and a further 5.8% decline projected for 2026. Against that backdrop, the post argues that EO has become essential humanitarian infrastructure rather than a useful supplement. The piece cites Yale University's Humanitarian Research Lab using high-resolution satellite imagery to document systematic attacks on agricultural communities around El-Fasher, Darfur — with satellite data serving as the only reliable evidence-gathering mechanism when ground access was impossible.

*Why this matters:* EO coverage is overwhelmingly supply-side: capabilities, constellations, and platforms. This piece makes the demand-side case directly, and the timing is pointed — as development finance contracts, the cost of *not* having persistent EO coverage becomes measurable in food security outcomes and evidentiary gaps in conflict documentation. EarthDaily is positioning itself not just as a data vendor but as an infrastructure actor with a public-interest mandate.

---

## Top Five Posts

**1. Food Security in Flux: Why Earth Observation Needs Its Moment** — *EarthDaily*
A rare demand-side EO argument: as ODA collapses and humanitarian budgets shrink, satellite imagery fills a monitoring gap that ground operations can't. The Sudan documentation case — Yale researchers using EO to record agricultural destruction in Darfur when no ground team could — is the sharpest single example of what EO's absence would cost. Unusually specific for a corporate blog.
→ [Read on EarthDaily](https://earthdaily.com/blog/food-security-in-flux-why-earth-observation-needs-its-moment)

**2. OGC Releases the Features and Geometries JSON (JSON-FG) Standard** — *Open Geospatial Consortium*
The formal publication of a standard that has been in development for four years. The practical upshot: GeoJSON can now carry non-WGS84 CRS, temporal attributes, 3D geometries, and typed features — without breaking any existing GeoJSON reader. The announcement is the reference point for anyone tracking standards adoption across OGC API – Features implementations.
→ [Read on OGC](https://www.ogc.org/announcement/ogc-releases-the-features-and-geometries-json-json-fg-standard/)

**3. TrustPoint secures USSF contract to demonstrate GPS-independent PNT** — *GPS World*
The news peg: a $4 million SpaceWERX TACFI contract to build and operate four satellites and four ground stations demonstrating C-band GPS-independent positioning. Worth reading alongside the ArkEdge/JAXA story from the same day — two separate actors, two different customers, same directional bet. The GPS World write-up includes the technical architecture details (trilateration, software-defined navigation, contested-environment reconfiguration) that most coverage omits.
→ [Read on GPS World](https://www.gpsworld.com/trustpoint-secures-ussf-contract-to-demonstrate-gps-independent-pnt/)

**4. QGIS NASA OPERA Plugin + AI Agent (Full Tutorial) 🤖🌍** — *Open Geospatial Solutions*
The feeds have plenty of commentary about AI agents and QGIS. This is a full tutorial. Open Geospatial Solutions continues to fill the practical cloud-native and remote sensing tutorial gap that the landscape context flags as one of the feeds' most persistent absences. NASA OPERA products cover surface water, disturbance, and displacement — pairing them with an AI agent in QGIS is exactly the kind of applied workflow content the community needs more of.
→ [Watch on YouTube](https://www.youtube.com/watch?v=8J37g9NxHmM)

**5. Seeing the Fault Lines: How New Technology Is Reshaping Utah's Earthquake Maps** — *Geo Week News*
The Utah Geological Survey remapped six counties of central Utah fault zones using LiDAR data that allows geologists to digitally strip vegetation from terrain and expose fault scarps invisible to aerial photography. Previous mapping relied on photos and fieldwork and missed subtle, eroded features. The result is a more complex fault network than previously documented, with direct implications for planning in a fast-growing rural region. LiDAR-for-hazard-mapping is almost never covered in the feeds despite being one of the technology's highest-value applied workflows.
→ [Read on Geo Week News](https://www.geoweeknews.com/news/seeing-the-fault-lines-how-new-technology-is-reshaping-utah-s-earthquake-maps)
