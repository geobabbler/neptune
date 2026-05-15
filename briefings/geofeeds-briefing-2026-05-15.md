# GeoFeeds Daily Briefing — Friday, May 15, 2026

*Covering posts from 0800 ET May 14 to 0800 ET May 15, 2026. Sources: 161 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Esri Drops the May 2026 Release: ArcGIS Pro 3.7**

Esri published roughly a dozen coordinated blog posts yesterday afternoon marking the May 2026 release of ArcGIS Pro 3.7. The release spans an unusual breadth of verticals: new hyperspectral imagery analysis tools, a geodesic flow direction method for hydrology, culvert modeling support in high-resolution DEMs, weighted Voronoi for spatial influence modeling, a Multicriteria Overlay tool, S-101 ENC nautical symbology, BIM/CAD updates, a layout redesign (volume 2), and companion releases of Drone2Map 2026.1 and ArcGIS Bathymetry 3.7. The hydrology workflow improvements — geodesic flow and culvert accounting — are technically specific in a way that signals genuine investment in precision water management use cases.

*Why this matters:* Esri is consolidating vertical-specific capabilities into a single coordinated release cadence. The hyperspectral tools in particular address a space that's been almost absent from the discourse despite real market demand. Breadth this wide in one drop also compresses the timeline for third-party tool developers responding to the new APIs.

---

**2. EO Production Quality and Novel Sensor Distribution**

Two posts from different corners of the EO market touched the same underlying question: what does it mean for EO data to be ready for production use? EarthDaily published "What Makes EarthDaily Data Science-Grade?" — a direct articulation of their quality criteria: consistent acquisition schedules, cross-calibrated sensors, true 5m resolution, and spectral depth. Separately, Spatial Source (Australia) reported that Spiral Blue, the budding space-based LiDAR firm, has selected Arlula's distribution platform to get data from its upcoming Teal satellites to market.

*Why this matters:* EarthDaily defining "science-grade" is a supply-side move to differentiate from commodity imagery providers. Spiral Blue/Arlula is the distribution side of the same problem with a novel sensor type. Both posts surface the EO value chain's persistent question: who defines quality, and who controls access? The LiDAR angle is especially notable — point cloud from orbit remains a genuine content gap.

---

**3. Positioning Resilience in Contested Environments**

Two GPS World pieces published back-to-back yesterday afternoon put dual-use positioning infrastructure in focus. BAE Systems Geospatial eXploitation Products (GXP) and Vantor announced a partnership to deliver high-accuracy targeting for drones operating in contested electronic warfare environments — specifically addressing GPS denial scenarios. Hours earlier, GPS World covered Telit Cinterion bundling Swift Navigation's Skylark Precise Positioning Service into an integrated IoT positioning stack. The same morning, Geospatial World published its awards video series from the April 29 Forum in Amsterdam, including Vantor CEO Dan Smoot winning Business Leader of the Year.

*Why this matters:* GNSS resilience in denied or degraded environments is now the central defense-geospatial investment thesis, and the Vantor/BAE announcement makes clear that the commercial precise positioning market and the defense targeting market have converged on the same architecture. Smoot winning Business Leader of the Year the same day underlines how quickly Vantor's trajectory has been recognized.

---

## Top Five Posts

**1. What Makes EarthDaily Data Science-Grade?** — *EarthDaily*
EarthDaily is one of the few EO operators publishing substantive content that engages data quality rather than just announcing capabilities — this post is an example of why. Their framing of "science-grade" as a system-level property (calibration, acquisition consistency, spectral depth, resolution integrity working together) is a direct counter to competitors claiming equivalent quality from different architectural choices. The landscape context flags EarthDaily as a signal source; this post justifies that designation.
→ [Read post](https://earthdaily.com/blog/what-makes-earthdaily-data-science-grade)

**2. Search and Visualize NASA Earth Data in QGIS with OpenGeoAgent** — *Open Geospatial Solutions*
Open Geospatial Solutions continues its OpenGeoAgent plugin tutorial series, this time covering how to search and visualize NASA Earth datasets directly inside QGIS via an AI agent interface. This sits squarely in the agentic GIS / MCP integration thread identified as a rapidly moving space in the landscape context, and it fills the persistent gap in practical cloud-native and applied remote sensing tutorials. Video format limits text scanning, but the substantive content is there.
→ [Watch video](https://www.youtube.com/watch?v=1dXV0nwrGG0)

**3. BAE Systems GXP, Vantor Fight EW with High-Accuracy Targeting for Drones** — *GPS World*
The specificity here is what makes it worth reading: the partnership explicitly targets contested electronic warfare environments where GPS is degraded or denied. BAE Systems GXP brings the intelligence and exploitation layer; Vantor brings the positioning resilience. The combination is a concrete signal of where defense-geospatial investment is concentrating — not just autonomous systems in general, but the specific problem of maintaining centimeter-accurate positioning when an adversary is actively trying to deny it.
→ [Read article](https://www.gpsworld.com/bae-systems-gxp-vantor-fight-ew-with-high-accuracy-targeting-for-drones/)

**4. Spiral Blue Selects Arlula's Distribution Platform** — *Spatial Source*
Spiral Blue's Teal satellites will carry space-based LiDAR — a sensor type so underrepresented in the feeds that any substantive coverage is inherently notable. Selecting Arlula as distributor is a market-structure decision: Arlula operates as a marketplace aggregating satellite data from multiple providers, giving Spiral Blue distribution without building their own customer acquisition. Short post but it opens a thread worth following as the Teal launch timeline becomes clearer.
→ [Read article](https://www.spatialsource.com.au/spiral-blue-selects-arlulas-distribution-platform/)

**5. ArcGIS Pro 3.7: New Hyperspectral Imagery Tools for GIS and Image Analysis** — *ArcGIS Blog*
Among the dozen ArcGIS Pro 3.7 release posts published yesterday, this one addresses the most persistently underserved domain in the feeds. Hyperspectral analysis has genuine traction in agriculture, environmental monitoring, and materials mapping, but almost no independent coverage exists to contextualize what Esri is building or how it compares to alternatives. Worth reading as a baseline for what native hyperspectral tooling inside Pro now looks like.
→ [Read post](https://www.esri.com/arcgis-blog/products/arcgis-pro/imagery/new-hyperspectral-analysis)
