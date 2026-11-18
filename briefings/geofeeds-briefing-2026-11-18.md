# GeoFeeds Daily Briefing — Wednesday, November 18, 2026

*Covering posts from 0800 ET November 17 to 0800 ET November 18. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Earth Embeddings Are Back on the Table**

The Spatial Edge led its research roundup with OlmoEarth v1.3 from the Allen Institute for AI, a model built specifically to produce embeddings. It squeezes Sentinel-1, Sentinel-2 and Landsat time series into a 64- or 128-number vector for each 10 m pixel, and an attention pooler leans on radar when clouds block the optical images. The 128-dimension version beat AlphaEarth Foundations and TESSERA v2 on 10 of 11 tasks while using 18% of the GPU hours of v1. Annual global embeddings for 2023 to 2025 are on Source Cooperative as Zarr, at roughly 150 TB a year, under a licence that bars military and extractive uses. The same issue covered E²Forecast, which predicts future embeddings instead of pixel values and halved forecast error. Spectral Reflectance flagged the OlmoEarth release too, along with a study that uses sparse autoencoders to work out what AlphaEarth and Tessera features actually represent.

*Why this matters:* Embeddings went quiet after CNG's April sprint. This restart looks different. Open, versioned global datasets with benchmarks and interpretability work are what infrastructure looks like, not demos. The licence restrictions deserve as much attention as the scores, because they decide who can actually build on it.

**2. Agents Pointed at Real Data**

Pietro Miotti's Maya site story showed up twice. The Spatial Edge reports that he had 48 AI agents scan about 1,200 km² of NASA G-LiHT lidar strips converted into images, and within roughly 72 hours he sent a report to Mexico's national archaeology institute, INAH, which had no registered site at that spot. A later update admits a 2025 paper had already mapped it and the agents missed it in their literature search. #geoObserver picked up the same story and called it a rediscovery. Spectral Reflectance noted that ECMWF published agent skills for forecasts, ERA5 and plotting, plus a remote MCP server at mcp.ecmwf.int that serves charts, meteograms and the Destination Earth catalogue. JonaAI went open source, turning plain-English requests into reproducible openEO workflows. Esri announced MCP support in ArcGIS Monitor 2026.1, and Ubotica's CogniSAT-6 spotted a cruise ship and scheduled its own follow-up observation.

*Why this matters:* The MCP thread is spreading from desktop GIS to data providers and even satellites. Miotti's story is the honest version of the pitch. Agents chewed through 1,200 km² of lidar in days, then missed the literature. Speed is real, but domain checking still decides whether a find is a find.

**3. The Unglamorous Work of Keeping Servers Up**

GeoSolutions published a lab-tested guide to Java4Shell, CVE-2026-114938, a memory corruption bug in the JVM's accelerated Base64 decoder that went public on November 17. It affects Java 17.0.6 and newer, 21, 25 and 27 on x86-64 processors with AVX-512 VBMI. Base64 carries login headers, so the decoder often runs before anyone authenticates. Oracle scores it 8.1 and the researchers 9.2. The mitigation is one JVM flag, -XX:-UseBASE64Intrinsics, and the post walks through GeoServer, MapStore, GeoNode, GeoNetwork's Elasticsearch and CKAN's Solr. Esri posted a Brotli and Node.js vulnerability advisory the same day. GeoSolutions also marked MassGIS turning 40, noting the agency has run GeoServer since 2005 and now handles over 200,000 GeoServer requests per business day. Spatialists covered the launch of SWISSGEO, a national geoportal run jointly by the Confederation and the cantons that will gradually absorb existing SDI services.

*Why this matters:* Sovereignty arguments for open source usually stop at licensing. Java4Shell shows the other half. Someone has to read the advisory, find which Java each container ships and restart it. MassGIS's twenty years on GeoServer is what that upkeep looks like when it's actually funded.

---

## Top Five Posts

**1. 🌐 Wildfire risk to US buildings could nearly triple by 2060** — *The Spatial Edge*
The lead study models changing fire and spreading settlement together, using a development record built from more than 370 million Zillow property records, and projects 133,200 to 449,100 buildings damaged or destroyed by mid-century. The rest of the issue covers OlmoEarth v1.3, embedding forecasting and the Maya lidar story, plus a warning about Sentinel-2B geolocation errors in products from October 20 to 22.
→ [🌐 Wildfire risk to US buildings could nearly triple by 2060](https://www.spatialedge.co/p/wildfire-risk-to-us-buildings-could)

**2. Java4Shell (CVE-2026-114938): what to do for GeoServer, MapStore, GeoNode, GeoNetwork and CKAN** — *Blog Archivi - GeoSolutions*
A practical response guide published a day after disclosure, with every step marked as tested or not. It shows which Java the checked Docker images and packages ship, how to confirm the flag with jinfo, and why standard Java 8 must not get the option at all, since it won't start.
→ [Java4Shell (CVE-2026-114938): what to do for GeoServer, MapStore, GeoNode, GeoNetwork and CKAN](https://www.geosolutionsgroup.com/blog/java4shell-cve-2026-114938-what-to-do-for-geoserver-mapstore-geonode-geonetwork-and-ckan/)

**3. Spectral Reflectance Newsletter #139** — *Spectral Reflectance*
A dense week of EO procurement news, including France's €1.5bn-plus IRIS military satellites, OHB's €554m Sentinel-3 Next Generation Topography contract and Greece's €69m HELLAS-SPACE 2.0 tender. It also carries a rare energy-sector customer story, with TenneT using Orbital Eye to monitor construction along a 263-pylon grid corridor.
→ [Spectral Reflectance Newsletter #139](https://www.spectralreflectance.space/p/spectral-reflectance-newsletter-139)

**4. Mapping Areas of Extraordinarily Low Population Density on the Tibetan Plateau** — *GeoCurrents*
Martin W. Lewis compares population-density maps whose lowest class stops at 20 or 50 people per square kilometer, leaving western China effectively blank. He then maps Ngari Prefecture by county with classes down to 0.15 to 0.24 people per square kilometer. It's a sharp lesson in how classification breaks hide real variation at the sparse end.
→ [Mapping Areas of Extraordinarily Low Population Density on the Tibetan Plateau](https://www.geocurrents.info/blog/2026/11/17/mapping-areas-of-extraordinarily-low-population-density-on-the-tibetan-plateau/)

**5. Four decades of MassGIS, twenty years on GeoServer** — *Blog Archivi - GeoSolutions*
A rare long-view look at a state SDI, from MassGIS's founding in 1986 to clustered GeoServer with PostGIS and Leaflet serving over 800 datasets with dynamic SLD styling. Usage numbers for January to September 2026, including more than 3,800 MassMapper launches per business day, give a concrete sense of what public geodata infrastructure carries.
→ [Four decades of MassGIS, twenty years on GeoServer](https://www.geosolutionsgroup.com/news/massgis-40-years-geoserver/)
