# GeoFeeds Daily Briefing — Wednesday, July 29, 2026

*Covering posts from 0800 ET July 28 to 0800 ET July 29. Sources: 162 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Land-Use Decisions Are Quietly Rewriting Risk Maps**

Three independent research write-ups landed within hours of each other: EarthStuff surfaced a UBC Hydrology Lab study showing forest harvesting in BC's Okanagan Valley turned a 20-year flood into a 2-year flood — a 10x increase that outweighed any benefit from declining climate-driven flood frequency. Separately, remote-sensing.org flagged a University of Würzburg-supervised assessment finding nearly 70% of 10,000+ German groundwater wells in significant decline, and EarthStuff also curated a Madagascar study on sacred hill sites as unexpected refuges for native plant diversity.

*Why this matters:* Nobody announced these findings — curators found them. That's the real story: management decisions (logging, groundwater draw-down, land protection status) are moving risk numbers by an order of magnitude, and the people tracking it are independent Substacks, not the agencies making the calls.

**2. AI-in-GIS Has Split Into Two Conversations That Aren't Talking to Each Other**

Justin's GIS Blog offered a ground-level account of a PhD student overcoming initial "this feels like cheating" resistance to using LLMs to fill geoprocessing knowledge gaps. On the same day, Esri published a post laying out its framework for responsible AI in ArcGIS.

*Why this matters:* One is a practitioner white-knuckling through real workflow gaps; the other is a vendor setting policy from above. The gap between "how do I actually use this tool today" and "here's our governance stance" is where most of the industry's AI anxiety still lives.

**3. Field Data Fragmentation Is the Unsexy Problem Everyone's Rebuilding Around**

Darling Geomatics launched MineSight, framing it explicitly around a pattern they've seen across active mine sites: plenty of data (drone flights, scans, survey points, production reports) but no shared home for it. vGIS made the same argument for utility construction — daily reports in Excel, photos on personal phones, quantities in yet another system.

*Why this matters:* Two unrelated verticals, one identical diagnosis: the bottleneck isn't data collection anymore, it's data cohesion. Every new "unified platform" pitch in this space is really just admitting the last decade of point solutions created the mess it's now selling the cure for.

---

## Top Five Posts

**1. Clear-Cut Logging Can Dramatically Increase Flood Risk** — *EarthStuff*
A tight, sourced summary of peer-reviewed attribution-science findings from BC's Okanagan Valley, with the actual mechanism (forest harvesting overwhelming a favorable climate trend) laid out rather than asserted. Exactly the kind of research-surfacing independent curation the ecosystem is short on.
→ [Read on EarthStuff](https://earthstuff.substack.com/p/clearcut-logging-can-dramatically)

**2. EAGLE Internship Presentation: Groundwater Level Trends in Germany** — *Earth Observation News*
A 10,000-well, 20-year national trend assessment using Mann-Kendall and Sen's slope methods, finding nearly 70% of monitored wells in significant decline. Rare to see this level of methodological specificity from a feed this size.
→ [Read on remote-sensing.org](https://remote-sensing.org/eagle-internship-presentation-groundwater-level-trends-in-germany-a-national-scale-assessment-using-in-situ-monitoring-data-and-grace-satellite-products/)

**3. Using AI Tools to Help with Geoprocessing** — *Justin's GIS Blog*
A candid, first-person account of moving past "using AI feels unethical" toward treating LLMs as a way to close specific programming knowledge gaps mid-PhD. Independent voice, no product to sell, genuinely reflective rather than promotional.
→ [Read on Justin's GIS Blog](https://justincolegis.com/2026/07/28/using-ai-tools-to-help-with-geoprocessing/)

**4. Dominic Royé: Betrachtungen zur Kartenprojektion** — *#geoObserver*
geoObserver's write-up of Dominic Royé's practical guide to map projection selection and common mistakes — cartographic fundamentals treated with real technical care, from one of the few consistent European FOSS4G voices in the ecosystem.
→ [Read on geoObserver](https://geoobserver.de/2026/07/29/dominic-roye-betrachtungen-zur-kartenprojektion/)

**5. Custom Python Raster Functions in ArcGIS Enterprise on Kubernetes** — *ArcGIS Blog*
A Developer's Lounge-style technical walkthrough on running custom raster processing on containerized Enterprise deployments — worth including on its own developer-workflow merits, not just because it came from a high-volume vendor feed.
→ [Read on ArcGIS Blog](https://www.esri.com/arcgis-blog/products/arcgis-enterprise/imagery/custom-python-raster-functions-arcgis-enterprise-kubernetes)
