# GeoFeeds Daily Briefing — Friday, November 27, 2026

*Covering posts from 0800 ET November 26 to 0800 ET November 27. Sources: 170 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Taking Stock of GeoAI, Warts and All**

Thanksgiving brought two different reads on the year in AI. David G. Smith's gratitude list credits vision foundation models with making automated extraction of roads, buildings, land cover, utility assets and ground points a practical part of production work. He says agentic GIS moved past demos in 2026, with agents linking data warehouses, imagery repositories and business systems, and he counts Gaussian splatting as a real visualization tool now that it pairs with drone and mobile mapping capture. Bonny McClain is warier. Drawing on her medical ghostwriting years, she argues that an LLM's geometry encodes association rather than truth. Ideas sit near each other because they show up together in human text, not because they're correctly related in the world. Models move well within that manifold but poorly off it, which is why they drift toward agreeing with whoever's asking. She ends wary of geospatial AI growing bottom-up without regulation.

*Why this matters:* Both posts land on the same point from opposite ends. Smith says agents make spatial professionals the stewards of these systems, and McClain explains why that stewardship can't be skipped. That's the reinvention debate in its mature form, less about survival and more about who checks the model's work.

**2. Movement You Can Read From Data Already Out There**

Two posts treated mobility as a dataset hiding in plain sight. Maps Mania featured Tailodds' Flights in the Air Right Now map, which infers winds at cruising altitude purely from aircraft. It compares each plane's heading with its ground track, using roughly 2,500 airliners over 30 minutes to estimate wind across about 750 one-degree cells, refreshed every half hour from public ADS-B data on adsb.fi. The Royal Netherlands Meteorological Institute already turns similar surveillance messages into upper-air wind observations for forecasting. Project Geospatial went big on the holiday itself. AAA expects 81.5 million Americans to travel at least 50 miles between November 24 and 30, with 72.9 million of them going by road. INRIX forecasts cover 16 corridors, four of them at more than double typical travel time, and the post leans on gravity models to explain why a grandmother's kitchen can briefly outweigh a metro job center.

*Why this matters:* It's the lesson the EO business keeps relearning. Raw signals are cheap, and the value sits in the pipeline that makes them decision-ready. Transponder messages and connected-vehicle data already describe winds and holiday traffic well. The open question is whether those streams stay public.

**3. Getting Data Out of Its Native Format**

Three posts dealt with the unglamorous work of moving data between worlds that don't share a language. Safe Software's FME blog walked through bridging CAD, BIM and GIS for AEC teams, citing San Francisco International Airport, which converted years of legacy CAD drawings, response zones and roadway routing for its Next Generation 911 system rather than rebuilding them by hand. The post also pitches automated contractor change detection with an audit trail and loading IFC models into a geodatabase at their real-world location. geoObserver tried Geofabrik's Postpass, a Go API over a read-only PostGIS database of OpenStreetMap that swaps Overpass QL for plain SQL and returns GeoJSON. A post box query over Halle ran fast. The DLR and JMU team at Earth Observation News reported from Dortmund, where students showed methods for semi-automatically pulling planning information out of historical Bebauungspläne and into the XPlan format.

*Why this matters:* Interoperability keeps beating novelty as the thing that actually saves people time. SQL over OSM is a small step toward the practical cloud-native tutorials this ecosystem lacks, and digitizing old zoning plans is the groundwork every agentic GIS pitch quietly assumes is already done.

---

## Top Five Posts

**1. Mapping the Wind with Planes** — *Maps Mania*
A clever, well-explained case of deriving one variable from another. The post lays out the crabbing logic, the roughly 2,500 aircraft and 750 grid cells behind each update and the World Magnetic Model correction, then points to KNMI's operational use of the same idea.
→ [Mapping the Wind with Planes](http://googlemapsmania.blogspot.com/2026/11/mapping-wind-with-planes.html)

**2. The ghost in the LLM...** — *Open-Source Solutions for Geospatial Analysis*
Bonny McClain connects her past as a medical ghostwriter to how language models represent meaning. Her core argument, that model geometry reflects co-occurrence in text rather than correctness in the world, is a useful frame for anyone evaluating GeoAI output.
→ [The ghost in the LLM...](https://bonnypmcclain.substack.com/p/the-ghost-in-the-llm)

**3. Postpass: OSM-Abfragen mit echtem SQL** — *#geoObserver*
A short, hands-on look at querying OpenStreetMap with SQL through Geofabrik's Postpass inside Overpass Turbo. It includes a working post box query plus links to the OSM wiki examples and the GitHub repo, so readers can try it in minutes.
→ [Postpass: OSM-Abfragen mit echtem SQL](https://geoobserver.de/2026/11/27/postpass-osm-abfragen-mit-echtem-sql/)

**4. Connecting CAD, BIM, and GIS: How AEC Organizations Turn Disconnected Design Data into Business Value** — *FME Blog - FME by Safe Software*
It's a vendor post, but it gets specific about three workflows: GIS to MicroStation deliverables, contractor change detection and IFC models into geodatabases. The SFO Next Generation 911 migration grounds it in a real project.
→ [Connecting CAD, BIM, and GIS: How AEC Organizations Turn Disconnected Design Data into Business Value](https://fme.safe.com/blog/2026/11/connecting-cad-bim-and-gis-how-aec-organizations-turn-disconnected-design-data-into-business-value/)

**5. The Great American Thanksgiving Migration** — *Geospatial Frontiers - Project Geospatial*
A long, data-heavy explainer that turns AAA and INRIX forecasts into interactive figures on travel mode share and corridor congestion. It doubles as a readable primer on spatial interaction and gravity models, and it's clear that its family scenarios are illustrative, not observed.
→ [The Great American Thanksgiving Migration](https://projectgeospatial.org/geospatial-frontiers/the-great-american-thanksgiving-migration)
