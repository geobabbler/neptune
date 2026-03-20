# GeoFeeds Daily Briefing — Friday, March 20, 2026

*Covering posts from 0800 ET March 19 to 0800 ET March 20, 2026. Sources: 137 geospatial feeds searched; 12 substantive posts after filtering.*

---

## Three Topics That Stood Out

**1. Independent Practitioners Building Their Own Data Plumbing**

Spatial Thoughts published a detailed walkthrough of building a custom CRM for their geospatial training academy, replacing scattered spreadsheets and SaaS platforms with a purpose-built system. Separately, North River Geographic shared hard-won tricks for writing ESRI File Geodatabases from PostGIS via GDAL's OpenFileGDB driver, including workarounds for persistent Esri software compatibility issues with GeoPackage. Both posts come from independent practitioners solving real operational problems with open-source tooling rather than waiting for vendor solutions.

*Why this matters:* The ecosystem's content gaps include practical tutorials and applied workflows. When independents document their own infrastructure decisions — CRM architecture, format interop pipelines — they fill a void that neither vendor blogs nor think-pieces address. This is where craft knowledge lives.

**2. Mapping the Hidden and the Off-Limits**

UBIQUE's Map of the Week featured SPUN's Underground Atlas, the first high-resolution global maps of mycorrhizal fungal biodiversity built from 2.8 billion DNA sequences. The Map Room surfaced the story of North Oaks, Minnesota — a city of 5,272 that got itself removed from Google Street View in 2008 because every road is privately owned, and has stayed invisible since. Both posts push at the boundaries of what can be mapped: one by making the subterranean visible, the other by examining what happens when a community opts out of visibility entirely.

*Why this matters:* Mapping has always negotiated between what's technically observable and what's socially permissible. As coverage of the physical world approaches saturation, the interesting frontiers are underground (SPUN, subsurface infrastructure) and in the governance of who controls spatial visibility.

**3. GPU Compute Enters the Satellite Imagery Pipeline**

Spatial Source reported that Planet has partnered with NVIDIA to use GPU technology for accelerating satellite image analysis. The same outlet covered drone-based LiDAR research measuring rockfall debris accumulation on steep slopes. Both point toward compute infrastructure — GPU clusters and UAV-mounted sensors — becoming as important as the imagery itself in the remote sensing value chain.

*Why this matters:* The dominant EO narrative has been "pixels are commodity; intelligence is differentiation." Planet's NVIDIA partnership makes the compute layer explicit: the bottleneck isn't acquiring imagery but processing it at speed. This accelerates the shift from selling data to selling inference.

---

## Top Five Posts

**1. Twenty Years, Part One** — *geoMusings by Bill Dollins*
Dollins opens a career retrospective spanning from AML development and analog-to-digital data conversion in 1993 to today's AI-driven real-time geospatial pipelines. The post frames three decades of technology change against a remarkably stable underlying thesis: spatial information has always had value, and the industries consistently seek to unlock it.
→ [Read on geoMusings](https://blog.geomusings.com/2026/03/19/twenty-years-part-one/)

**2. Building a CRM for My Small Business** — *Spatial Thoughts*
Ujaval Gandhi documents the decision to build a custom CRM for Spatial Thoughts' training academy rather than adopt an off-the-shelf solution. The post walks through the specific pain points — querying scholarship recipients, finding certified participants by country and skill — that drove the build decision. Rare example of a geospatial educator publishing operational infrastructure decisions rather than just curriculum.
→ [Read on Spatial Thoughts](https://spatialthoughts.com/2026/03/20/training-academy-crm/)

**3. Tricks with an ESRI File Geodatabase** — *North River Geographic Systems*
A practitioner's battle-tested guide to writing ESRI File Geodatabases from PostGIS using GDAL's OpenFileGDB driver, including the backstory of trying (and failing) to get clients to accept GeoPackage. The ogr2ogr command examples and compatibility workarounds are the kind of concrete workflow documentation the ecosystem chronically lacks.
→ [Read on North River Geographic](https://www.northrivergeographic.com/tricks-with-an-esri-file-geodatabase/)

**4. Map of the Week: Earth's Mycorrhizal Networks** — *UBIQUE*
Covers SPUN's Underground Atlas — the first global maps of mycorrhizal fungal biodiversity, derived from 2.8 billion DNA sequences. The mapped fungal network spans an estimated 450 quadrillion kilometres in the top 10 cm of soil alone. Noteworthy because biodiversity and conservation GIS is one of the ecosystem's persistent content gaps, and subsurface mapping at this scale is genuinely novel.
→ [Read on UBIQUE](https://ubiqueags.org/map-of-the-week-earths-mycorrhizal-networks/)

**5. Minnesota's Unmappable City** — *The Map Room*
North Oaks, Minnesota removed itself from Google Street View in 2008 by leveraging the fact that all city roads are private property — and it has remained invisible ever since. A compact case study in location privacy that sits in another chronic content gap: the legal and governance dimensions of who controls spatial visibility.
→ [Read on The Map Room](https://www.maproomblog.com/2026/03/minnesotas-unmappable-city/)
