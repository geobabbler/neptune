# GeoFeeds Daily Briefing — Tuesday, March 24, 2026

*Covering posts from 0800 ET March 23 to 0800 ET March 24. Sources: 142 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Canada Is Having a Geo Moment**

The GoGeomatics weekly digest dropped a notably dense edition: the Department of National Defence is investing in sovereign launch capabilities and the Canadian space industry; Inline Group has acquired Challenger Geomatics; an Arctic Infrastructure Initiative was announced; and Natural Resources Canada updated its Canada Flood Map Inventory alongside new natural hazard data. Separately, GoGeomatics reported that ISO/TC 211 will hold its 62nd plenary meeting in Ottawa this spring, co-located with GeoIgnite 2026, where Arup has also signed on as a supporting sponsor. That is a lot of institutional momentum converging on one country in one week.

*Why this matters:* The Canadian sovereignty thread has been building for months. What's new is that it's now spanning simultaneous moves across defence, commercial consolidation, national hazard data, and international standards hosting — all at once. Ottawa is positioning itself as a credible anchor for the global geospatial standards community.

**2. EO Constellations Push Toward Real-Time and Daily Revisit**

Satellogic announced its new Merlin constellation, designed for daily 1-metre optical remapping of the entire Earth; the first satellite launches in October with full fleet capability in early 2027. On the same day, Open Cosmos announced a convergence of broadband connectivity, Earth observation, and IoT into what it is calling the largest space-based real-time data service, positioning the offering for critical infrastructure monitoring and rapid event response.

*Why this matters:* The industry has been talking about "decision-ready intelligence" for years. These announcements operationalize it: daily 1m revisit plus real-time IoT telemetry is the data stack that commercial verticals — logistics, insurance, infrastructure — actually need. Whether the go-to-market execution matches the architecture is the open question.

**3. Flood and Hazard Mapping Having a Policy Moment**

Three distinct threads touched flood and hazard mapping in the same window. NRCan's update to the Canada Flood Map Inventory (in the GoGeomatics digest) signals active federal investment in national risk data. MapAction posted a video reflection from a field member who spent time mapping for humanitarian partners during the Mozambique floods response in January–February 2026. And mapscaping.com launched an interactive FEMA flood zones explorer built on the National Flood Hazard Layer, making FEMA's NFHL data browsable in a clean public-facing tool.

*Why this matters:* Flood risk mapping sits at the intersection of insurance, government liability, and climate adaptation — three sectors where geospatial data has measurable financial stakes. The MapAction post is a rare glimpse of the humanitarian deployment layer; the FEMA tool represents the public-access layer. Both exist because the underlying data infrastructure is being actively maintained and expanded.

---

## Top Five Posts

**1. Urban Relativity** — *somethingaboutmaps*
Daniel Huffman returns to tutorial form with a detailed walkthrough of scale ranking for city label selection — a technique he's used for years but never written up. The post explains why population-threshold approaches fail in dense metro suburbs (fifteen of Michigan's most-populous cities are Detroit suburbs), and offers a relative-importance algorithm as an alternative. This is exactly the kind of reproducible cartographic craft content that is chronically absent from the feeds.
→ [Read the tutorial](https://somethingaboutmaps.wordpress.com/2026/03/23/urban-relativity/)

**2. Canadian Geospatial Digest — March 23rd, 2026** — *GoGeomatics*
The densest single post of the window. Five substantive stories in one: DND sovereign launch investment, the Inline Group / Challenger Geomatics acquisition, an Arctic infrastructure initiative, the NRCan flood map inventory update, and new natural hazard data. Any one of these would be a standalone post on a slower day; GoGeomatics put them all in one weekly digest that's worth reading top to bottom.
→ [Read the digest](https://gogeomatics.ca/canada-geomatics-news-spaceport-arctic-infrastructure-flood-mapping-updates/)

**3. Satellogic's Merlin to Offer Daily 1m Imagery** — *Spatial Source*
Concise announcement on the Merlin constellation: first launch October 2026, full fleet by early 2027, targeting daily global 1-metre coverage. Spatial Source's coverage is brief but links through to the primary Satellogic announcement. The 1m-daily specification is the key number — it's the threshold where commercial decision workflows (change detection, site monitoring) become operationally viable at scale.
→ [Read the announcement](https://www.spatialsource.com.au/satellogics-merlin-to-offer-daily-1m-imagery/)

**4. Add Time Support for Groups in QGIS Server** — *Oslandia*
Julien Cabieces documents an Oslandia contribution to QGIS Server, adding WMS-T temporal support for layer groups — enabling grouped image time-series to be animated and served via WMS GetMap with TIME parameters. The use case comes from Ifremer, which wanted to distribute time-sequenced coastal imagery through its own web portal. The post is code-forward with concrete before/after behaviour, and the Ifremer collaboration gives it a real applied anchor.
→ [Read the post](https://oslandia.com/en/2026/03/24/ajout-du-support-temporel-pour-les-groupes-dans-qgis-server/)

**5. Cadastral Data in IFC Format** — *Spatialists – geospatial news*
Switzerland's KGK-CGC has made cadastral survey data available in IFC format via geodienste.ch, with four cantons live and more expected. The data includes 3D terrain and building models from swisstopo. IFC is the dominant open standard for Building Information Modelling workflows. This is a rare example of national mapping infrastructure deliberately bridging into the built-environment sector — the kind of cross-domain data integration that the feeds almost never cover.
→ [Read the post](https://spatialists.ch/posts/2026/03/23-cadastral-data-in-ifc-format/)
