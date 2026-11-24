# GeoFeeds Daily Briefing — Friday, November 20, 2026

*Covering posts from 0800 ET November 19 to 0800 ET November 20. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. AI Speeds Up the Work, Not the Judgment**

Ali Ahmadalipour's GeoAI Unpacked traces how Earth data got easier to reach, from NASA, NOAA and USGS archives through Google Earth Engine in 2010, AWS Open Data, Microsoft's Planetary Computer and, lately, Hugging Face. His core point is that access isn't discovery. He's watched people treat reanalysis products as ground truth because the resolution looked good, and he names Earthmover, SkyFi, Cecil, Source Cooperative and Dynamical.org as players chipping away at that friction. He sketches an agentic marketplace that links to every public and private dataset without hosting any of them. Fulcrum made a parallel argument from the field. AI can turn an agency's paper inspection form into a digital app in minutes, but it misses the unwritten rules scientists apply by habit. Fulcrum's fix is a six-point check covering conditional logic, units, math and signatures, plus one test record. Esri's Location Platform update headlined developer tools for agentic workflows.

*Why this matters:* Both posts land where Dollins has been for months. AI doesn't remove the need to understand your data. The agentic thread is shifting from wiring tools together to deciding which output deserves trust. Fulcrum's environmental compliance angle is also a rare commercial-vertical story.

**2. Open Tooling Keeps Getting More Practical**

Open Geospatial Solutions posted five parts of its eight-part NGIS 2026 workshop in a single evening. The series opens with GeoLibre and cloud-native GIS, then moves through cloud-hosted COG, PMTiles, GeoParquet and STAC data, symbology and print layouts, attribute editing and spatial SQL with DuckDB in the browser, and analysis with buffers, H3 hot spots, terrain and drive times. Geography Realm published two pieces on the formats people actually trip over. One explains common GIS file extensions, from shapefiles and GeoPackages to ArcGIS Pro and QGIS project files. The other shows how to pull the data out of an Esri MPKX map package, which QGIS can't open directly. Lutra Consulting, meanwhile, is crowdfunding QGIS 3D work and previewed scene presets. A new 3D map can start as CAD/BIM, with exact colours on a plain background, or as realistic as the user wants.

*Why this matters:* Practical cloud-native tutorials are still one of the ecosystem's biggest gaps, so an eight-part workshop running from STAC to browser DuckDB is worth more than another format announcement. The MPKX workaround is a reminder that interoperability still breaks at the desktop file, not the cloud bucket.

**3. Who Owns the Map, and the Grid Beneath It**

A Library of Congress guest post by intern Jonaton Baginski shows how geopolitics decides map copyright. During World War II the Office of the Alien Property Custodian seized U.S. copyrights to more than 100,000 German books, patents and maps, including German maps of Russia that were really captured Soviet sheets with German labels printed over the Cyrillic. Because Russia declared itself the USSR's continuator state and the 1996 URAA restored foreign copyrights, a 1973 Soviet military map of Washington, D.C. stays protected until 2068. A 1954 Soviet map of the Baltic SSRs belongs to Russia, not Lithuania. GoGeomatics reported that a Council of Canadian Academies expert panel chaired by Denis Hains found major gaps in Canada's geodetic infrastructure and outlined three ways to strengthen positioning, navigation and timing. Geoconnexion covered a Digital Sovereignty conference where nearly 250 professionals discussed geospatial's role in personal safety, emergency response and national resilience.

*Why this matters:* This is the analytical "who controls it" side of the sovereignty thread, not the procurement side. Copyright follows whichever state inherited the mapping agency. Canada's sovereignty debate has mostly been about ownership, but the CCA panel is about plumbing, the geodetic layer every other dataset sits on.

---

## Top Five Posts

**1. How geospatial data became easier to use** — *GeoAI Unpacked*
Ahmadalipour draws on 16 years of remote sensing work, starting with downloading individual MODIS tiles, to explain why discoverability lags behind accessibility. The closing section pitches a link-only data marketplace paid for by promoted listings and convenience fees, with hedge funds as a likely premium buyer. That's a rare business-model argument written from the user's side.
→ [How geospatial data became easier to use](https://geoaiunpacked.substack.com/p/how-geospatial-data-became-easier)

**2. Same Streets, Different Empires: The Hidden Narrative of Map Copyright** — *Worlds Revealed*
A clear walk through the Trading with the Enemy Act, state succession and URAA copyright restoration, told through real sheets held by the Geography and Map Division. It also describes the internal ArcGIS tool Baginski built so staff can work out which maps are safe to open up to the public.
→ [Same Streets, Different Empires: The Hidden Narrative of Map Copyright](https://blogs.loc.gov/maps/2026/11/same-streets-different-empires/)

**3. The Settlement and Controversial Abandonment of High-Elevation Areas of North-Central Tibet** — *GeoCurrents*
A follow-up to the previous day's population-density post that supplies the history behind the empty map. In 1974 some 5,000 herders moved north from Xainza County to the Nyima area, and two years later another 2,000 drove an estimated 160,000 sheep and yaks to Shuanghu. It shows that a sparse region on a map can carry a long policy history.
→ [The Settlement and Controversial Abandonment of High-Elevation Areas of North-Central Tibet](https://www.geocurrents.info/blog/2026/11/19/the-settlement-and-controversial-abandonment-of-high-elevation-areas-of-north-central-tibet/)

**4. Waldmonitor: Zum Zustand unserer Wälder** — *#geoObserver*
A pointer to the new release of Germany's Waldmonitor, which uses ten years of Copernicus Sentinel overpasses to assess forest condition across the whole country every year. The interactive map covers canopy height and cover, tree species, deadwood, vitality trends, damaged areas, surface temperature anomalies and current fire detections. It's the kind of operational forest monitoring these feeds rarely show.
→ [Waldmonitor: Zum Zustand unserer Wälder](https://geoobserver.de/2026/11/20/waldmonitor-zum-zustand-unserer-waelder/)

**5. How environmental teams turn paper forms into field-ready digital apps with AI** — *Fulcrum*
A concrete checklist instead of an AI pitch. The six checks for completeness, conditional logic, units, math, signatures and report output, plus a single test record, give environmental teams a way to vet AI-drafted field forms that must match an agency's required codes, calculations and reporting layouts.
→ [How environmental teams turn paper forms into field-ready digital apps with AI](https://www.fulcrumapp.com/blog/digitize-paper-forms-with-ai-and-keep-agency-rules-intact/)
