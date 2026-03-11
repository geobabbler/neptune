# GeoFeeds Daily Briefing — Wednesday, March 11, 2026

*Covering posts from 0800 ET March 10 to 0800 ET March 11. Sources: 119 geospatial feeds.*

---

## Three Topics That Stood Out

**1. QGIS 4.0 Norrköping Arrives — Familiar on the Surface, Rebuilt Underneath**

The open-source geospatial world's biggest software event in years landed on March 9–10: QGIS 4.0 "Norrköping" is out for Windows, Linux, and Mac. Coverage rolled in from Spatialists (Ralph Straumann called it "rebuilt on Qt6 with over 100 new features") and Oslandia (who flagged immediately that plugins will need migration and offered their consulting services to help). The release is explicitly labeled an "early adopter" build — not production-ready — which is a notable act of restraint from the QGIS team. The core change is the jump from Qt5 to Qt6, a framework-level migration that has been in the works for years and unblocks a new generation of performance and security improvements. Deprecated APIs are mostly retained to smooth the plugin transition, but the old QGIS 2.x Processing API is now on borrowed time.

*Why this matters:* QGIS's willingness to ship a major version as an explicit "adventurous users only" release is a template for how open-source projects can manage breaking changes honestly. The plugin ecosystem is the real test — if key plugins migrate quickly, QGIS 4.x will consolidate its position as the professional open-source GIS platform.

**2. GNSS Is Being Jammed in an Active Conflict Zone — and the Market Is Responding**

The Map Room flagged BBC News reporting on GPS jamming in and around the Strait of Hormuz, tied to the U.S.-Israel-Iran conflict. The interference is affecting maritime shipping in one of the world's most critical chokepoints. This isn't new behavior — jamming and spoofing in contested regions has been documented for years — but the Hormuz disruption is notable for its scale and the explicit connection to an ongoing military confrontation. On the same day, Earth Imaging Journal covered InfiniDome's upcoming debut of its "Aura" GNSS protection system at XPONENTIAL Europe in Düsseldorf (March 24–26): a multi-antenna, multi-band protection system capable of suppressing up to three interference sources simultaneously per frequency band.

*Why this matters:* GNSS dependence is a structural vulnerability for everything from maritime navigation to precision agriculture to autonomous systems. Active jamming in Hormuz is not a niche military problem — it directly affects commercial shipping. The InfiniDome announcement is supply-side signal that a protection hardware market is materializing around this vulnerability.

**3. Your Spatial ML Model Is More Confident Than It Should Be**

The Spatial Edge's weekly edition surfaced a paper challenging a widespread assumption in environmental remote sensing: that standard Random Forest and XGBoost configurations give you reliable uncertainty estimates. They don't — these models are systematically overconfident when estimating spatial uncertainty, which matters enormously for applications like aboveground biomass mapping where decision-makers need to know not just the estimate but how much to trust it. The newsletter's five-minute breakdown also covered Bayesian approaches to deforestation detection, synthetic data for hyperspectral sharpening, deep learning for landslide hazard monitoring, and a new building height estimation dataset.

*Why this matters:* The GeoAI hype cycle is dominated by point predictions. But uncertainty quantification is what separates usable deployed systems from demo-stage research. As AI-generated geospatial outputs get embedded in real decisions — infrastructure planning, disaster response, carbon markets — overconfident models are a liability, not a feature.

---

## Top Five Posts

**1. Knowing when to doubt the data** — *The Spatial Edge*
The week's sharpest piece of applied research translation. The core finding — that standard ML configurations produce systematically overconfident spatial uncertainty estimates — is widely applicable and underappreciated. Five research papers distilled into five minutes, with the practical implications made explicit. Required reading for anyone building geospatial ML pipelines that will inform actual decisions.
→ [Read it](https://www.spatialedge.co/p/knowing-when-to-doubt-the-data)

**2. Introducing the Foursquare Ask API** — *Foursquare*
Foursquare has shipped a natural language place search endpoint that accepts queries like "a cozy spot for a first date" rather than requiring callers to translate human intent into category filters and price parameters. The framing is honest about why structured place search has always been limiting: the gap between how people describe what they want and how APIs have historically expected to receive it. Whether the implementation lives up to the premise is for developers to test, but the architectural direction — location as a natural language interface, not a taxonomy exercise — is the right one.
→ [Read it](https://foursquare.com/resources/blog/developer/introducing-the-foursquare-ask-api/)

**3. More on GPS Jamming in the Strait of Hormuz** — *The Map Room*
A short post that points to a large problem: active GPS jamming affecting commercial shipping in one of the world's busiest maritime chokepoints, connected to live military conflict. Jonathan Crowe links to the BBC News report, which contextualizes this as part of a longer history of maritime GPS interference. Worth reading alongside the InfiniDome GNSS protection announcement to see both the threat and the commercial response in the same news cycle.
→ [Read it](https://www.maproomblog.com/2026/03/more-on-gps-jamming-in-the-strait-of-hormuz/)

**4. Geo-enabling Apache Hop** — *Spatialists – geospatial news*
Stefan Ziegler has been building GDAL/OGR reader and writer plug-ins for Apache Hop, the open-source ETL tool, along with interactive geometry previews. This is early-stage work, but the direction matters: a fully geo-capable open-source data integration pipeline has been a gap in the FOSS4G stack for years. Ralph Straumann's coverage is appropriately measured ("early days, but promising progress"), which is exactly the right framing for a project worth tracking.
→ [Read it](https://spatialists.ch/posts/2026/03/10-geo-enabling-apache-hop/)

**5. Quantifying distributed energy resource value for investor-owned utilities** — *Fulcrum*
A commercial vertical post — and therefore automatically notable. Fulcrum's writeup makes a direct case for how location matters in the energy transition: distributed energy resources like solar and storage deliver real grid value only when deployed where they relieve actual grid constraints, and quantifying that value requires standardized field data collection tied to spatial context. The energy vertical is almost invisible in the geospatial feeds despite being a major EO and GIS market; posts like this one are worth reading precisely because they're rare.
→ [Read it](https://www.fulcrumapp.com/blog/quantifying-distributed-energy-resource-value-for-investor-owned-utilities/)
