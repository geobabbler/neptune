# GeoFeeds Daily Briefing — Saturday, November 7, 2026

*Covering posts from 0800 ET November 6 to 0800 ET November 7. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Spatial data platforms get rebuilt on lakehouse ideas**

David G. Smith published two posts on the same afternoon, both written from the seat of someone overhauling an enterprise data platform. In one, he says Apache Iceberg has moved from a niche data engineering topic into something architects discuss seriously, and he ties it to Portolan and the STAC Iceberg Extension that's still being developed. His argument is that cloud-native formats, object storage and STAC are quietly replacing layers of traditional GIS infrastructure. In the other, he takes a research paper on a Knowledge Graph Lakehouse and asks how to keep a connected view of environmental and regulatory data without building a monolithic graph that goes stale. EarthDaily came at a neighboring question from the imagery side, publishing seven questions buyers should ask before trusting Earth observation data. Smith builds the plumbing and EarthDaily scrutinizes the product, but both ask whether data can be relied on.

*Why this matters:* Cloud-native geo is moving from format debates to table-level architecture, and a practitioner is tracking it from inside an enterprise. EarthDaily's trust questions echo the Beyond Open Data argument that usefulness beats openness, though its blog is still vendor content.

**2. Positioning gets less exotic and more routine**

Three posts looked at how location gets pinned down and put to work. xyHt ran an adaptation of peer-reviewed research from Greek authors on aligning PPP-derived coordinates to the national datum, HGRS1987, through a velocity field. The core point is that centimetre-level PPP coordinates aren't automatically local-datum coordinates. GoGeomatics marked 25 years of one of North America's first real-time GNSS networks, recalling that correction services were once new and met with skepticism and now touch nearly every region, state and province, plus entire countries. Earth Imaging Journal carried Trimble's announcement of WorksManager Drone, which lets civil contractors process drone photogrammetry in the cloud inside the Trimble ecosystem. Together they cover the reference frame, the infrastructure that delivers corrections and the contractor workflow that consumes the result. None of it is flashy, and that's the point, because mature positioning is mostly about getting coordinate systems to agree.

*Why this matters:* Surveying and geodesy get little airtime next to EO and AI in these feeds, so three posts in a day stand out. xyHt and GoGeomatics add depth the usual discourse lacks, and the contractor angle touches a commercial vertical the ecosystem rarely shows.

**3. Checking hazard models against what actually happened**

Several posts asked whether the models behind risk decisions hold up. GoGeomatics wrote that after another severe wildfire season, Ottawa's $285 million in pre-ignition spending needs a way to show whether it is reducing risk at all. EarthStuff shared a study of Cyclone Harry, which in January 2026 produced the highest individual wave height ever recorded in the Mediterranean. The authors combined observations, high-resolution morphodynamic datasets and XBeach and HEC-RAS simulations at 19 coastal sites across Sardinia, Malta, Sicily and Calabria, and found inundation strongly shaped by local geomorphology. EarthStuff also shared a paper from the ETERNALHIMA project that couples the HBV hydrological model with a global glacier model. Its finding is that good streamflow simulations don't guarantee realistic glacier melt estimates. A spending program, a storm reconstruction and a melt model all face the same demand for evidence that the numbers describe the real world.

*Why this matters:* Buyers of hazard analytics rarely speak in this ecosystem, which is dominated by tool builders, so a post asking whether a $285 million program works is a useful demand-side question. Measurable outcomes are exactly what the GeoAI conversation keeps skipping.

---

## Top Five Posts

**1. Icebergs, Maps, and Where We Can Go With Spatial Data Lakes** — *Thoughts & Insights — David G. Smith*
It connects Apache Iceberg, Portolan and the emerging STAC Iceberg Extension into one argument about where spatial infrastructure is heading. The author is a working data platform owner, which gives the piece a practitioner's grounding. It's the sort of cloud-native architecture thinking the feeds don't offer often.
→ [Icebergs, Maps, and Where We Can Go With Spatial Data Lakes](https://davidgsmith.net/thoughts/icebergs-maps-and-where-we-can-go-with-spatial-data-lakes.html)

**2. Bridging PPP and a Legacy National Datum: A Velocity-Driven Transformation to HGRS1987** — *xyHt*
It explains why PPP coordinates can't simply be treated as local-datum coordinates and how a velocity field closes the gap, using a Greek case study. The magazine says up front that it adapts previously published research. Geodesy at this depth is hard to find elsewhere in the feeds.
→ [Bridging PPP and a Legacy National Datum: A Velocity-Driven Transformation to HGRS1987](https://www.xyht.com/magazine/magazine-magazine/bridging-ppp-and-a-legacy-national-datum-a-velocity-driven-transformation-to-hgrs1987/)

**3. Ottawa’s $285-Million Wildfire Bet Needs a Way to Know If It’s Working** — *GoGeomatics*
It asks the question public spending rarely answers, which is whether money spent before ignition is lowering risk. That's real policy analysis rather than a digest or sponsorship item, which clears the higher bar GoGeomatics posts need. It also bears on the Canadian sovereignty and infrastructure conversation.
→ [Ottawa’s $285-Million Wildfire Bet Needs a Way to Know If It’s Working](https://gogeomatics.ca/ottawas-285-million-wildfire-bet-needs-a-way-to-know-if-its-working/)

**4. Unprecedented Storm Impact In The Mediterranean Revealed By Models And Seismic Noise During Cyclone Harry** — *EarthStuff*
EarthStuff surfaces academic work other feeds miss, and this one covers the highest wave height ever recorded in the Mediterranean. The study blends hydrodynamic simulation at 19 coastal sites with seismic microseism analysis. It links to the paper's DOI for readers who want the full method.
→ [Unprecedented Storm Impact In The Mediterranean Revealed By Models And Seismic Noise During Cyclone Harry](https://earthstuff.substack.com/p/unprecedented-storm-impact-in-the)

**5. Why the Idea of a "Knowledge Graph Lakehouse" Has Me Thinking About Environmental Data** — *Thoughts & Insights — David G. Smith*
Smith reads a research paper through the lens of environmental and regulatory data systems and names the trap of the monolithic graph. It's a thoughtful look at a stubborn problem from someone who has hit it repeatedly. The environmental compliance setting is a commercial vertical the feeds seldom cover.
→ [Why the Idea of a "Knowledge Graph Lakehouse" Has Me Thinking About Environmental Data](https://davidgsmith.net/thoughts/why-the-idea-of-a-knowledge-graph-lakehouse-has-me-thinking-about-environmental-data.html)
