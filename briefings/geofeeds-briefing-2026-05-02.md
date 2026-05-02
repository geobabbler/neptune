# GeoFeeds Daily Briefing — Saturday, May 2, 2026

*Covering posts from 0800 ET May 1 to 0800 ET May 2, 2026. Sources: 153 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Starlink Kills Its Shadow GPS — and the GNSS Resilience Problem Gets Sharper**

Ed Parsons published a precise analysis of SpaceX's decision to shut down the local gRPC location API on Starlink dishes, effective May 20, 2026. The service — which users in maritime and off-grid communities had been using as a jamming-resilient positioning fallback — derived accurate location from the constellation's orbital geometry without touching GNSS at all. SpaceX's stated reason is a local network trust vulnerability. Parsons frames it as a concrete illustration of the security-versus-utility tradeoff that runs through all location infrastructure design, and notes the background: GNSS jamming and spoofing are active, persistent problems in the Black Sea and the Middle East.

*Why this matters:* The resilience case for alternative positioning was never hypothetical — it was already in active use. That SpaceX is removing it for security reasons, not capability ones, highlights a structural gap: non-GNSS positioning options that are both reliable and available are vanishingly rare. The geospatial community hasn't developed a serious alternative infrastructure response.

---

**2. Panoramax Reaches 100 Million Images — and Eyes a Move Beyond France**

Spatialists' Ralph Straumann covered Panoramax, the open and federated street-level imagery project built jointly by France's national mapping agency IGN and the French OpenStreetMap community. The project has crossed 100 million geolocated images and is now forming a foundation structure aimed at expansion beyond its French origins. Straumann notes the project's architecture — federated, open, non-commercial — explicitly positions it as an alternative to Google Street View rather than a complement to it. A companion Spatialists post flagged another development in the open geospatial infrastructure space: Google Earth has added Shapefile import support, prompting industry reactions ranging from genuine delight to bafflement. Straumann's read: it "reads as legacy, but may be clever" — a quiet acknowledgment that legacy formats have long half-lives and that reaching users where they are still matters.

*Why this matters:* Street-level imagery is one of the last major geospatial data layers with no credible open alternative at scale. Panoramax is the first serious attempt to change that. The combination of an institutional backer (IGN), a community contributor base (OSM France), and a federated architecture is the right combination to avoid the single-point-of-failure problem that has plagued prior open mapping projects. Whether it can scale internationally is the open question.

---

**3. Critical Infrastructure as Public Map Data — The Dam Safety Series**

mapscaping.com published a tight cluster of posts applying the Army Corps of Engineers National Inventory of Dams to public-facing safety questions: "Most Dangerous Dams in the US: 2,645 High-Hazard Dams in Poor Condition," "Tallest Dams in the US: The 30 Tallest Dams in America," and "Dam Hazard Classifications Explained." All three use interactive maps drawn live from NID data. The "most dangerous" framing is carefully defined — not probability of failure, but the combination of high-hazard potential (failure would cause loss of life) and poor or unsatisfactory condition. The result is 2,645 dams that are both consequential and structurally degraded. Fulcrum published separately on situational awareness for infrastructure operators, arguing that fragmented visibility is a structural problem across the sector — and that the core issue is consolidating data that already exists but isn't connected.

*Why this matters:* The dam series exemplifies a pattern the feeds mostly miss: converting publicly available government data into something the public can actually interrogate. The NID has existed for decades; the question is who surfaces it and how. Mapscaping's data-product model — high-volume, state-by-state interactive maps — is unglamorous but fills a real access gap. The Fulcrum posts are supply-side (selling a field data platform), but the operational awareness framing is consistent with a broader industry recognition that infrastructure visibility requires spatial context, not just dashboards.

---

## Top Five Posts

**1. The End of Starlink's "Pseudo-GPS": Security over Utility** — *edparsons.com*
Ed Parsons writes with precision about a real, time-bounded event — SpaceX shutting down a positioning capability that was already in operational use as a GNSS fallback in contested environments. The post goes beyond the announcement to explain the local network trust architecture that made it a liability, and names the geopolitical context (Black Sea and Middle East GNSS degradation) that made it valuable. The clearest independent technical-editorial piece of the window.
→ [Read on edparsons.com](https://www.edparsons.com/2026/05/the-end-of-starlinks-pseudo-gps-security-over-utility/)

**2. Sh*pefile in Google Earth** — *Spatialists – geospatial news*
Short and sharp from Ralph Straumann. Google Earth now imports Shapefiles — a format that was supposed to be on its way out for fifteen years — and the community reaction reveals the gap between format idealism and format reality. Straumann's framing ("reads as legacy, but may be clever") is the kind of non-obvious editorial take that makes Spatialists consistently worth reading.
→ [Read on spatialists.ch](https://spatialists.ch/posts/2026/05/01-shapefile-in-google-earth/)

**3. Panoramax** — *Spatialists – geospatial news*
Straumann covers Panoramax crossing 100 million images and beginning the process of formalizing a foundation structure for international expansion. The post is short but lands the key structural point: Panoramax is built to be federated and non-commercial, which is the only architecture that has ever worked for community-contributed geospatial data at scale. Worth watching as the project moves from French initiative to international infrastructure candidate.
→ [Read on spatialists.ch](https://spatialists.ch/posts/2026/05/02-panoramax/)

**4. Cercana Executive Briefing — Week of April 25–May 1, 2026** — *Cercana Systems LLC*
Cercana's weekly executive briefing (which monitors 153 feeds, confirming the current ecosystem count) leads with VertiGIS's £87 million acquisition of 1Spatial — the largest geospatial M&A event in recent months, combining enterprise data quality tooling with location intelligence. The briefing identifies vendor consolidation as the dominant theme of the week. A useful synthesis for anyone tracking the platform layer of the industry.
→ [Read on cercanasystems.com](https://cercanasystems.com/2026/05/cercana-executive-briefing-week-of-april-25-may-1-2026/)

**5. Most Dangerous Dams in the US: 2,645 High-Hazard Dams in Poor Condition** — *mapscaping.com*
The strongest of Mapscaping's dam series. The analytical framing is clear and non-sensationalized: "dangerous" means high consequence plus poor condition, not imminent failure. The combination of the USACE NID live data feed, the hazard-plus-condition filter, and the interactive map produces something genuinely useful for anyone working in infrastructure resilience planning. One of the rare cases in the feeds where a data product is also an editorial argument.
→ [Read on mapscaping.com](https://mapscaping.com/most-dangerous-dams-in-the-us/)
