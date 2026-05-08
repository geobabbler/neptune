# GeoFeeds Daily Briefing — Friday, May 8, 2026
**Friday, May 8, 2026 — 0800 EDT**
*Monitoring 160 feeds across the geospatial ecosystem*
*Coverage window: 0800 EDT May 7 → 0800 EDT May 8 (1200–1200 UTC)*

---

## Today's Themes

### 1. Two Practitioners Think Out Loud About AI Agents and GIS — On the Same Day

GEO Jobe and Bill Dollins (geoMusings) each published substantive pieces about AI agents, MCP, and geospatial workflows within two hours of each other on May 7, and together they form an unusually coherent conversation. GEO Jobe's post frames an "identity problem" in ArcGIS agentic workflows: the company has built MCP servers that let AI agents generate dashboards and Story Maps from natural language, but the hard question is how those agents authenticate, act on behalf of users, and fit into enterprise GIS permission models. Dollins draws on his GeoFeeds MCP work to argue that the skill/MCP boundary maps neatly onto a distinction geospatial practitioners already understand — the difference between a workflow and an API, as in FME versus WFS. What's notable is that both posts are practice-oriented and grounded in things already built, not speculation. The community is moving from "what could agents do in GIS" to "here is what we ran into when we shipped one."

### 2. Earth Observation Hardware Is Accelerating on Two Fronts

EarthDaily confirmed contact with six newly launched constellation satellites (EDC-02 through EDC-07), delivered via a SpaceX Falcon 9 rideshare and now in initial operations. The company's goal is daily global measurement of planetary change — a cadence that only becomes credible with a functional constellation behind it. This launch materially closes the gap between ambition and orbit. Separately, Pixxel announced plans for on-orbit EO imagery processing on its Pathfinder satellite: AI training and inference running directly in orbit, with full-stack language models aboard. These are not the same kind of story — one is about coverage density, the other about processing architecture — but both point toward the same structural shift: the intelligence layer in EO is moving closer to the sensor.

### 3. The Climate Signal Is Showing Up in the Spatial Record

EarthStuff's coverage of the Alaska landslide-tsunami in the Dickson Fjord is the most compelling geoscience story in the window. A 481-metre tsunami runup — the second-largest ever recorded — was enabled directly by decades of glacier retreat: without that retreat, the landslide would have hit ice, not water, and no tsunami would have formed. The post makes the climate attribution explicit and grounds it in the geomorphological literature. Meanwhile, UBIQUE's map of US tornado reports through April shows Illinois with 119 preliminary reports — more than double second-place Mississippi and nearly 100 above its own historical average for the same period. Both stories are fundamentally about using spatial data to surface a climate signal that isn't visible any other way.

---

## Top Posts of the Day

**1. A 481-Metre-High Landslide-Tsunami In A Cruise Ship–Frequented Alaska Fjord** — *EarthStuff*
A lucid breakdown of the Dickson Fjord event, connecting glacier retreat to landslide trajectory to tsunami generation — and drawing out the broader lesson about how climate change is reshaping hazard profiles in glacial environments.
[Read →](https://earthstuff.substack.com/p/a-481-metre-high-landslide-tsunami)

**2. Joining 130 Million Points** — *Spatialists*
Dewey Dunnington revisits his 2024 spatial join benchmark with SedonaDB and DuckDB Spatial added to the field. The result: 6 seconds on a laptop versus the 3–5 minutes and 50 GB of RAM the same job required just over a year ago — a 30–50x improvement that is directly relevant to any practitioner working at scale.
[Read →](https://spatialists.ch/posts/2026/05/07-joining-130-million-points/)

**3. ArcGIS Agentic Workflows Have an Identity Problem** — *GEO Jobe*
A candid post-mortem from a team that has shipped MCP servers for ArcGIS. The core tension: AI agents that act on behalf of users need to authenticate as those users, and enterprise GIS permission models weren't designed with that in mind.
[Read →](https://geo-jobe.com/arcgis-agentic-workflows-have-an-identity-problem/)

**4. Pixxel Plans On-Orbit EO Imagery Processing** — *Spatial Source*
Pixxel's Pathfinder satellite will run AI training and inference directly in orbit — moving the processing stack off the ground and onto the sensor itself.
[Read →](https://www.spatialsource.com.au/pixxel-plans-on-orbit-eo-imagery-processing/)

**5. EarthDaily Advancing Daily Global Measurement of Planetary Change with Six Satellites Launched** — *Geoconnexion*
Satellites EDC-02 through EDC-07 confirm initial contact after a Falcon 9 rideshare launch, putting a daily-cadence global observation constellation within operational reach.
[Read →](https://www.geoconnexion.com/news/earthdaily-advancing-daily-global-measurement-of-planetary-change-with-six-satellites-launched)

---

*GeoFeeds monitors 160 feeds across the geospatial industry ecosystem. Briefing window: 0800–0800 EDT.*