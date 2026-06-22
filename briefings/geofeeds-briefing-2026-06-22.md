# GeoFeeds Daily Briefing — Monday, June 22, 2026

*Covering posts from 0800 ET June 21 to 0800 ET June 22. Sources: 113 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Two EO AI Models in One Morning**

Tessera, a new foundation model from an Australian outfit covered by Spatial Source, fuses Sentinel-2 optical and SAR data to produce trained embeddings — landing it squarely in the active earth embeddings thread that CNG and others have been building out since Q1 2026. Hours later, Earth Observation on Medium published a technical look inside the Sentinel-2 super-resolution model embedded in the EOMasters Toolbox, describing the architecture choices behind scaling Sentinel imagery beyond its native 10m ceiling. The two pieces don't know each other, but they arrive at the same underlying question: what is the right representation of satellite imagery for downstream intelligence tasks?

*Why this matters:* The earth embeddings conversation is moving from sprint-and-standard (CNG's sprint writeups) to shipping product. Two distinct EO AI models appearing on the same morning — one framing the output as embeddings, one focused on resolution enhancement — signals the foundation model market is entering a productization phase, not just a research one.

---

**2. The Economic Intelligence Argument for EO**

Project Geospatial's Geospatial Frontiers published "The Thermal Economy," one of the more ambitious pieces the feed ecosystem has produced recently — framing thermal infrared satellites as the sensing layer for a new class of financial intelligence, from steel furnace output to hyperscaler cooling demand. The argument is that thermodynamics governs the real economy and is largely invisible to conventional data sources; satellites make it legible. On the same morning, Earth Observation News summarized a new paper using deep learning fusion of multisource remote sensing inputs to generate sub-national GDP estimates for data-scarce regions — a different vertical, the same move: converting raw satellite observations into economic-layer intelligence.

*Why this matters:* The dominant EO narrative has long been "raw pixels are a commodity; the intelligence pipeline is the product." These two pieces show that argument maturing: the economic intelligence layer is no longer theoretical but being built in specific verticals — energy, macroeconomics, industrial monitoring — with real methodological scaffolding.

---

**3. R's Quiet Applied Work**

Two R packages landed within five minutes of each other on Earth Observation News this morning. EireR tackles a structural data access problem: Ireland is one geographic island split across two political jurisdictions with incompatible portals, APIs, coordinate systems, and standards. The package provides a unified programmatic gateway for analysts working across the Republic and Northern Ireland. The second package, agropvR, quantifies the environmental impact of agrophotovoltaic installations — solar panels co-located over active farmland — a land use conflict question that is both practically important and analytically underserved. Both are student-originated tools from the European academic EO community, addressing problems that commercial foundation model pipelines do not touch.

*Why this matters:* The persistent gap in the feeds is practical spatial data science tooling — reproducible workflows for real institutional problems. These two packages fill corners the mainstream GeoAI discourse ignores entirely: cross-jurisdictional data access and agri-solar land use quantification. Worth watching whether EireR triggers equivalent efforts for other jurisdictionally fragmented geographies.

---

## Top Five Posts

**1. The Thermal Economy: The Financial Value of the Emerging Satellite Infrared Ecosystem** — *Project Geospatial (Geospatial Frontiers)*
The most ambitious analytical piece of the window, arguing that every act of energy conversion produces thermal radiation that satellites can now read at commercial scale — and that this makes thermal infrared the sensing layer for financial intelligence on energy systems, industrial output, and supply chain activity. The framing ("thermodynamics governs the real economy") is more conceptually serious than most EO commercial-case writing, and the piece connects specific satellites and sensor characteristics to specific financial signal types. One of the rare EO commercial vertical arguments that goes beyond "customers want insights."
→ [Read on Project Geospatial](https://projectgeospatial.org/geospatial-frontiers/the-heat-economy-the-financial-value-of-the-emerging-satellite-infrared-ecosystem)

**2. Tessera AI Model Takes on the Earth Observation World** — *Spatial Source*
Spatial Source covers the launch of Tessera, a foundation model that ingests Sentinel optical and radar data and produces embeddings as its core output format — making it one of the cleaner implementations of the earth-embeddings paradigm the CNG community has been formalizing. The piece is brief, but it connects the model explicitly to the embeddings framing and adds an Australian voice to a conversation dominated by North American and European players. Worth reading alongside the CNG sprint writeup from April.
→ [Read on Spatial Source](https://www.spatialsource.com.au/tessera-ai-model-takes-on-the-earth-observation-world/)

**3. How to Fit a City into 32mb** — *Spatialists*
Spatialists surfaces a Game Maker's Toolkit deep-dive into GTA III's rendering engine — how Rockstar squeezed a 4km open world into PlayStation 2 RAM using spatial streaming, level-of-detail models, and memory optimization — and draws the direct line to modern 3D geospatial applications facing the same constraints. The post is short but the connection is unusually productive: the techniques that made open-world gaming possible at low memory are exactly the techniques that will determine whether city-scale 3D geospatial becomes operationally viable at scale. A useful re-framing from an unexpected direction.
→ [Read on Spatialists](https://spatialists.ch/posts/2026/06/21-how-to-fit-a-city-into-32mb/)

**4. New Paper on GDP Estimation from Space** — *Earth Observation News*
Covers a peer-reviewed study using a deep learning fusion architecture across multiple remote sensing inputs to generate sub-national GDP estimates in regions where ground-truth economic data is sparse or unavailable. The relevance is structural: sub-national economic data is a persistent gap in development policy and financial risk assessment, and multisource EO fusion is now mature enough to produce publishable, defensible estimates. The paper title — "From Space to Economy" — is blunter than most academic framing, which is probably appropriate.
→ [Read on Earth Observation News](https://remote-sensing.org/new-paper-on-gdp-estimatation-from-space/)

**5. EireR R Package: Unified Gateway to Irish Geospatial Data** — *Earth Observation News*
Describes an R package that unifies programmatic access to geospatial data across Ireland's two jurisdictions — the Republic and Northern Ireland — bridging incompatible portals, APIs, and coordinate systems into a single interface. The technical lift is modest; the structural problem it solves is not. Jurisdictional fragmentation of geospatial data is a near-universal problem in contested or divided geographies, and Ireland's two-system landscape is a well-documented case. If the package works as described, it is directly replicable for any analyst working across national borders with mismatched data infrastructure.
→ [Read on Earth Observation News](https://remote-sensing.org/eirer-r-package-unified-gateway-to-irish-geospatial-data/)
