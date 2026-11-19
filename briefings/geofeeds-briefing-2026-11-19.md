# GeoFeeds Daily Briefing — Thursday, November 19, 2026

*Covering posts from 0800 ET November 18 to 0800 ET November 19. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Deciding What AI Is Allowed to Touch**

FME's blog made the day's sharpest MCP point. The protocol standardizes how AI clients discover and call tools, but it doesn't govern what those tools can reach or change. Safe Software suggests treating access as two layers, a connection layer that controls who can reach a server and an execution layer that controls which data, credentials and side effects a tool can touch. Its advice is to build scoped, purpose-built tools, filter sensitive fields inside the tool so the AI never sees them, and run separate MCP servers by team or role. Microsoft opened a GeoStats preview in Planetary Computer Pro that computes raster statistics for an organization's own geometries and publishes them as analysis-ready tables, using an agricultural lender watching farm vegetation as its example. Esri pitched "vibe solutioning" with its ArcGIS Solutions Assistant and showed Solutions deployment to disconnected ArcGIS Enterprise 12.2 environments for defense and intelligence users.

*Why this matters:* The MCP thread is moving from "can it connect" to "what should it be allowed to touch," which is the question security teams ask before anything ships. Microsoft's farm lender example matters too. A commercial customer story, even a hypothetical one, is rare in these feeds.

**2. Sharper Pixels, Wider Coverage**

Spatial Source carried two pieces of sensor news from very different corners of EO. ICEYE announced its forthcoming Gen 5 satellite with 11 cm resolution and claims it will be the sharpest commercially built SAR system in the world. A CSIRO-developed workflow combines hyperspectral imagery from Italy's PRISMA, Germany's EnMAP and NASA's EMIT into an Australian mineral ore map spanning 200 spectral bands. EarthStuff flagged the opposite of a single sharp image, a continental InSAR product. Researchers processed more than 77,000 Sentinel-1 images from 2014 to 2026, covering 522 ascending and descending frames, with a fully automated MSBAS workflow. The result is a set of 40 m deformation rate mosaics for the contiguous United States and parts of southern Canada and northern Mexico, with line-of-sight, east-west and vertical rates free to download. Spatial Source also reported that SSC Space will provide communications for Curtin University's Binar-5, Binar-6 and Binar-7 missions.

*Why this matters:* Hyperspectral applications and SAR interferometry are two gaps these feeds rarely fill, and mining almost never appears as a customer. ICEYE, months after its €10B-plus valuation, keeps pushing resolution. The free InSAR mosaics may matter more to working analysts than another resolution record.

**3. LiDAR and Field Capture Get Practical**

LiDAR got more applied coverage than usual. Oslandia's QSunPotential plugin, now at version 2.3.0, pulls roof slope, orientation and surface from CityForge, the QGIS plugin that builds 3D buildings from LiDAR and footprints, then outputs solar indicators from the European PVGIS calculator. That makes France's newly open IGN LiDAR usable for rooftop solar screening, and CRAIG funded the work. Hidonix launched its Hido II rover through a limited partner deployment program after a CES 2026 debut, pitching faster indoor mapping that copes with stairwells, a story both Geoconnexion and Spatial Source picked up. XenomatiX will supply Italian pavement engineering firm SINA S.p.A. with a multifunctional vehicle for road and airport pavement inspection. Fulcrum took on what happens after capture. Environmental soil boring logs, it argues, fail audits over missing timestamps, mismatched chain-of-custody sample IDs and unrecorded meter IDs and calibration checks, not over bad geology.

*Why this matters:* Point cloud workflows are still the most conspicuous gap in these feeds, so a day of applied LiDAR, mobile mapping and indoor capture stands out. Fulcrum's point applies to all of it. Field data is only as defensible as its provenance, and regulators will check that first.

---

## Top Five Posts

**1. Continental-Scale Sentinel-1 InSar Deformation Rate Mosaics Of Central North America** — *EarthStuff*
EarthStuff points to a Remote Sensing of Environment paper and the open dataset behind it, built from more than 77,000 Sentinel-1 scenes. The 40 m mosaics include vertical and east-west deformation rates, and the post links a Utah Geological Survey explainer on tracking ground motion with InSAR. It's a ready-to-use SAR interferometry product, not a methods demo.
→ [Continental-Scale Sentinel-1 InSar Deformation Rate Mosaics Of Central North America](https://earthstuff.substack.com/p/continental-scale-sentinel-1-insar)

**2. MCP for the Enterprise: How to Give AI Governed Access to Data** — *FME Blog - FME by Safe Software*
A practical governance framework for exposing enterprise data to AI clients, split into connection and execution layers. It argues that narrow tools over clean data give more reliable answers than broad access to every system, and it recommends bringing IT and security in early. Useful for anyone moving an MCP experiment toward production.
→ [MCP for the Enterprise: How to Give AI Governed Access to Data](https://fme.safe.com/blog/2026/11/mcp-for-the-enterprise-how-to-give-ai-governed-access-to-data/)

**3. What environmental soil boring data needs to survive an audit** — *Fulcrum*
A specific look at why Phase II environmental soil boring logs fall apart in regulatory review, from retyped paper logs to drilling depths written down from memory. It lists what a defensible log needs, including a visible, dated audit trail for every correction. It's vendor content, but it offers a rare demand-side view of field data in environmental consulting.
→ [What environmental soil boring data needs to survive an audit](https://www.fulcrumapp.com/blog/what-environmental-soil-boring-data-needs-to-survive-an-audit/)

**4. QSunPotential now works with LiDAR data** — *Oslandia*
A short release note with real substance, chaining two QGIS plugins to turn open IGN LiDAR into rooftop solar estimates. It includes a demo video and credits CRAIG for funding, a concrete case of public money backing open-source geospatial tooling.
→ [QSunPotential now works with LiDAR data](https://oslandia.com/en/2026/11/19/qsunpotential-fonctionne-desormais-avec-des-donnees-lidar/)

**5. How to Build a Free Flight Sim** — *Maps Mania*
The first part of a tutorial series that builds a browser flight simulator without paid mapping APIs, terrain services or a game engine. Part 1 renders 3D terrain of the Matterhorn with MapLibre and ships a live demo and full source on GitHub. Hands-on web mapping tutorials like this are scarce in these feeds.
→ [How to Build a Free Flight Sim](http://googlemapsmania.blogspot.com/2026/11/how-to-build-free-flight-sim.html)
