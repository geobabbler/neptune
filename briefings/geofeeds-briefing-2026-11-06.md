# GeoFeeds Daily Briefing — Friday, November 6, 2026

*Covering posts from 0800 ET November 5 to 0800 ET November 6. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Who keeps the open-source foundations standing**

Two posts looked at the people and code that everything else rests on. geoObserver reported that Even Rouault, the lead maintainer of GDAL, has resigned as a member and chair of the GDAL PSC after an email to the project on Wednesday evening. Rouault says he'll follow along from a distance but is willing to help if needed, and the author notes it's still unclear whether he's leaving development entirely. The post lists reasons for hope, starting with the fact that GDAL's code is open and can carry on. Oslandia, meanwhile, summarized months of work on memory safety in QGIS. It cites the NSA's 2022 report that memory management problems sit behind roughly 70 percent of vulnerabilities at Microsoft and Google. One story is about a person and the other is about a codebase, but both ask what it takes to keep heavily used tools trustworthy.

*Why this matters:* GDAL sits underneath nearly every geospatial stack, commercial ones included. Sovereignty talk rarely asks who funds and succeeds the maintainers of that open infrastructure. A single resignation shows how much of the industry's plumbing rests on a handful of people.

**2. Elevation and 3D capture hit milestones**

Three posts tracked how we measure and model the ground. xyHt reported that USGS marked completion of baseline 3DEP data acquisition at Geo Week 2026 in Denver, giving the United States its first consistent high-resolution lidar coverage, with IfSAR standing in for cloud-covered Alaska. The piece says the collaboration is commonly valued around a billion dollars and that the harder question now is the cost of keeping a national elevation model current, and who documents it well enough to trust. Spatial Source ran a SimActive piece featuring Dr. Jules Morel of Mirukuru in Japan, asking whether Gaussian splatting will replace textured meshes and where it fits in real workflows. Spatial Source also covered a New Zealand start-up selling InSAR-based ground movement reports to people in the property market. That makes one national baseline, one possible successor format and one consumer-facing use of radar.

*Why this matters:* Lidar is the ecosystem's biggest content gap, so a finished national dataset deserves attention. The maintenance question is the real story, echoing the Beyond Open Data argument. The InSAR item is also a rare real estate use case.

**3. Documentation as a byproduct of the work**

Several posts treated records as something the work itself should produce. Geoconnexion reported that Sodex Innovations launched SDX-AutoScan for Trimble Earthworks, which uses the positioning system already on a bulldozer and syncs 3D site models to Trimble Connect, so daily as-builts come out of normal operation. Geoconnexion also noted that Trimble integrated drone data processing into WorksManager, turning flight data into site data on one connected platform. Fulcrum wrote about field evidence in corrective and preventive action, arguing that a root cause built from memory and scattered photos leaves the same finding turning up at the next inspection. Its stormwater example walks through the 5 whys method and points to ISO 14001 requirements for documented evidence of nonconformities. The common thread is capture that happens at the point of work instead of in a separate survey step or a later reconstruction.

*Why this matters:* Construction and environmental compliance are commercial verticals that this ecosystem rarely shows from the buyer's side. Here the pitch is concrete, with fewer survey trips and audit-ready evidence. Most of it is vendor content, but it shows where demand-side value actually sits.

---

## Top Five Posts

**1. Hiobsbotschaft: Even Rouault verlässt GDAL** — *#geoObserver*
The most consequential news in the window, and it's reported by the German-language FOSS4G watcher that the landscape notes as essential European radar. The author quotes Rouault's resignation email and lays out why the project can continue. Readers who skip non-English feeds would miss it.
→ [Hiobsbotschaft: Even Rouault verlässt GDAL](https://geoobserver.de/2026/11/05/hiobsbotschaft-even-rouault-verlaesst-gdal/)

**2. The Billion-Dollar Basemap** — *xyHt*
It marks the completion of 3DEP baseline acquisition and then moves straight to the costly part, which is keeping a national elevation model current and documented. It's rare lidar coverage with a clear argument about long-term data stewardship.
→ [The Billion-Dollar Basemap](https://www.xyht.com/magazine/magazine-magazine/the-billion-dollar-basemap/)

**3. Improving Memory Safety in QGIS** — *Oslandia*
A practical account of a security work package, framed by the NSA's memory safety guidance and the 70 percent figure. It explains the objectives without drowning in detail, and it shows what funded maintenance of open-source GIS software looks like.
→ [Improving Memory Safety in QGIS](https://oslandia.com/en/2026/11/06/amelioration-de-la-surete-memoire-dans-qgis/)

**4. Will Gaussian Splatting Replace 3D Textured Meshes?** — *Spatial Source*
It compares splats with traditional photogrammetry outputs and asks where each belongs in real workflows. The piece comes from a SimActive conversation with a data analyst in Japan, which adds a non-Western practitioner view. It's also a useful follow-up to the splatting products now reaching market.
→ [Will Gaussian Splatting Replace 3D Textured Meshes?](https://www.spatialsource.com.au/will-gaussian-splatting-replace-3d-textured-meshes/)

**5. The role of field data in root cause analysis and CAPA process** — *Fulcrum*
It's vendor content, but it addresses environmental compliance from the user's side, with a stormwater example and the 5 whys method. Posts about how commercial customers actually use field data are scarce in these feeds.
→ [The role of field data in root cause analysis and CAPA process](https://www.fulcrumapp.com/blog/the-role-of-field-data-in-root-cause-analysis-and-capa-process/)
