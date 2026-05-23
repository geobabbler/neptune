# GeoFeeds Daily Briefing — Saturday, May 23, 2026

*Covering posts from 0800 ET May 22 to 0800 ET May 23. Sources: 161 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Esri's pre-UC content drum roll**

With the 2026 Esri User Conference on the horizon, the ArcGIS Blog flooded the feeds on Friday with at least four posts in a single day: topographic mapping changes arriving in ArcGIS Pro 3.7 and Enterprise 12.1, a preview of field operations apps coming to the UC, and a POI comparison walkthrough in Business Analyst. The volume and timing are characteristic of Esri's pre-conference publishing pattern — surfacing feature previews weeks in advance to prime the audience before the big San Diego week. The topographic mapping post is the most substantive, signaling a notable release to Pro and Enterprise in tandem.

*Why this matters:* Esri's UC remains the industry's single largest annual gathering. The pre-conference content wave is when Esri signals strategic priorities. Watching which products get blog posts — and which don't — is a reliable indicator of where the platform is heading.

---

**2. Geospatial standards, quietly advancing**

Two posts touched data specification work on Friday, from different corners of the stack. Spatialists highlighted the OGC's release of JSON-FG — a GeoJSON superset that adds support for coordinate reference systems beyond WGS84, temporal feature properties, and 3D geometry types, while remaining fully backward compatible with existing GeoJSON tooling. Separately, the ArcGIS Blog published a technical explainer on datum ensembles — the ISO 19111 mechanism for handling situations where multiple geodetic datums apply to the same area. Neither post is flashy, but together they represent the continuing maturation of the standards layer beneath the industry's louder conversations.

*Why this matters:* Cloud-native infrastructure discussions dominate the feeds, but the underlying standards work that makes interoperability possible moves slowly and quietly. JSON-FG's CRS flexibility directly addresses one of GeoJSON's longest-standing limitations — the hard lock to WGS84 — and may accelerate cloud-native pipeline adoption in jurisdictions with national datums.

---

**3. Three years of Vantor: what Advent's Maxar bet looks like now**

TerraWatch Space published a substantial co-authored analysis of Advent International's Maxar acquisition, three years on. Written by a former venture investor (Filip Kocian) and TerraWatch founder Aravind Ravichandran, the piece dissects what Advent actually bought, what Vantor (the rebranded entity) has become, and what the deal says about the commercial optical EO market. The dual authorship — finance hat and strategy hat — produces a more structurally rigorous read than typical industry commentary.

*Why this matters:* The Maxar/Vantor story is the clearest lens available on whether commercial optical EO can sustain a premium private equity valuation outside the public markets. With EarthDaily's NRO contract and the ongoing consolidation of the optical constellation market, TerraWatch's analysis comes at a moment when the EO business model question is live again.

---

## Top Five Posts

**1. Three Years On: Analysing Advent's Maxar Acquisition** — *TerraWatch Space Newsletter*
The day's most analytically substantial piece. Co-authored with a former investor, it goes deeper than the typical narrative arc — structured as three discrete questions: what was bought, what it's become, and what it means. Rare to see this level of financial rigor applied to an EO deal in the industry feeds.
→ [Read the analysis](https://newsletter.terrawatchspace.com/three-years-on-analysing-advents-maxar-acquisition/)

**2. GeoJSON innovation: OGC Features and Geometries JSON** — *Spatialists – geospatial news*
Concise and precise summary of the JSON-FG release from OGC. The CRS-beyond-WGS84 and 3D geometry additions are the headline changes, and Ralph Straumann's framing — backward-compatible for legacy, expressive for modern clients — captures the design intent clearly. Worth flagging to any team running GeoJSON pipelines.
→ [Read the post](https://spatialists.ch/posts/2026/05/23-geojson-innovation-ogc-features-and-geometries-json/)

**3. AI Haumaru, AI Motuhake Mō Te Māori GIS Kaupapa — Safe, Secure, Sovereign Artificial Intelligence Use For Māori GIS Projects** — *EarthStuff*
Alasdair Rae surfaces a webinar and the Te Kāhui Raraunga Māori AI governance framework, focused on local LLMs for data privacy and sovereign AI infrastructure in indigenous GIS contexts. The intersection of geospatial data sovereignty and AI deployment for indigenous communities is a genuine gap in the feeds, and the local LLM angle is practically specific, not just rhetorical.
→ [Read the post](https://earthstuff.substack.com/p/ai-haumaru-ai-motuhake-mo-te-maori)

**4. Working with HLS Data in QGIS: Access, Visualization, and Analysis** — *Open Geospatial Solutions*
A tutorial video on accessing and analyzing NASA's Harmonized Landsat Sentinel (HLS) data directly in QGIS. Practical cloud-native remote sensing tutorials remain one of the most persistent content gaps in the feeds, and the HLS dataset — fusing Landsat and Sentinel-2 into a consistent 30m surface reflectance record — is underused relative to its analytical value.
→ [Watch the tutorial](https://www.youtube.com/watch?v=viyxjhVmYUo)

**5. Which City Has the Highest Per Capita Number of Billionaires?** — *GeoCurrents*
Martin Lewis uses a deceptively simple geographic question to expose the inconsistency and population-denominator blindness in AI-generated geographic answers — ChatGPT and Grok default to Monaco, Gemini to San Francisco, none defaulting to small German or Danish cities that may actually win on a per-capita basis when definitions tighten. It's a tight empirical piece, and a neat illustration of why structured geospatial data and clear definitional precision still matter.
→ [Read the post](https://www.geocurrents.info/blog/2026/05/22/which-city-has-the-highest-per-capita-number-of-billionaires-monaco-san-francisco-or-could-it-be-ingelheim-in-germany-or-billund-in-denmark/)
