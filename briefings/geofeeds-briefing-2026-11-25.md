# GeoFeeds Daily Briefing — Wednesday, November 25, 2026

*Covering posts from 0800 ET November 24 to 0800 ET November 25. Sources: 170 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Measuring Emissions and Water From Above**

Three announcements pointed remote sensing at emissions and water use that usually go unmeasured. GeoConnexion reported that eight Japanese organizations, including shipping line NYK, MUFG Bank, ArkEdge Space, Shimizu Corporation, the City of Yokohama and two port operators, signed an agreement on November 25 to develop remote sensing that measures greenhouse gas emissions from ships at a distance and bring it into practical use. Spatial Source covered a remote sensing aircraft used to map how methane emissions differ between industry and agriculture. Hydrosat announced the next generation of IrriWatch, its thermal infrared irrigation platform, which now stretches from field-level irrigation planning to water-use and performance monitoring across entire countries. The Spatial Edge added a useful supply note. Sentinel-2A's extension campaign will now run until the end of 2027, a year longer than planned, so there'll be more Sentinel-2 imagery than the usual two-satellite setup provides.

*Why this matters:* Agriculture, shipping and a bank in one news cycle is rare for feeds that mostly narrate government buyers. MUFG's seat at the Yokohama table hints at who pays for emissions measurement once it works. That's the commercial demand side this ecosystem almost never shows.

**2. GeoAI With the Numbers Attached**

The Spatial Edge led with a GeoAI study that reports its effect sizes. Google and partners plugged embeddings from Google Earth AI's Population Dynamics Foundation Model into existing health models as extra covariates, with no fine-tuning, across five case studies in the US, Canada, Mexico and the DRC. Vaccination coverage R² in 146 US border counties rose from 0.159 to 0.216, and a single month of embeddings matched census measures built on 60 months of pooled survey data for cardiovascular disease. Postpartum depression barely moved, AUC up just 0.002. The same issue covered Microsoft's Anaximander, which runs any deep learning model inside QGIS. In a Western Cape field-boundary test, DelineateAnything on a local CPU beat GPT-image-1 and SAM 3. GoGeomatics looked at AI firms using remote sensing to predict wildfires. EarthStuff supplied the counterweight, reporting that Copilot and Gemini both hallucinated instructions for renaming an ArcGIS Pro project.

*Why this matters:* Earth embeddings went quiet after the spring sprints, so a paper with honest gains, including near-zero ones, beats another demo. Most GeoAI coverage is aspirational and supply-side. This is closer to deployed evidence, and the chatbot failures show why domain knowledge still matters.

**3. Desktop Tools Follow the Data**

Esri announced Databricks SQL Warehouse support in ArcGIS Pro 3.8, tagged for query layers and feature binning, so Pro users can work against lakehouse tables without copying them into a geodatabase first. Another Pro post covered Protected Access for Microsoft OneDrive files. MapTiler Engine 14.2 now runs natively on Apple Silicon M-series Macs with no Rosetta 2, bringing faster launches, stable processing of large datasets and faster JP2 handling. On the open-source side, The Spatial Edge noted that QGIS has changed its long-term release plans because of remaining issues in the 4.x series. The next LTR is now expected to be QGIS 4.4.4 on March 5, 2027, with a new "LTR 4.x Blocker" tag and a paid bug-fixing period stretched from four to six weeks. At Würzburg, two EAGLE students taught classmates to build a QGIS plugin from scratch.

*Why this matters:* Cloud-native geo's bet is one copy of the data with many engines on top. Esri wiring Pro into Databricks concedes that the warehouse, not the geodatabase, is often where data lives now. QGIS delaying its LTR is the healthier signal, picking stability over the calendar.

---

## Top Five Posts

**1. 🌐 Plugging gaps in disease surveillance with Google's embeddings** — *The Spatial Edge*
The lead study is a careful test of whether general-purpose geospatial embeddings help public health models, and it reports where they don't. The rest of the issue is just as dense, with Tokyo park payback times from 1.79 million GPS-tracked visits, Microsoft's Anaximander for QGIS, a 4,910-signal InSAR landslide dataset and Google's new GEM-15 elevation model in Earth Engine.
→ [🌐 Plugging gaps in disease surveillance with Google's embeddings](https://www.spatialedge.co/p/plugging-gaps-in-disease-surveillance)

**2. The Search for Equilibrium in the Software Market** — *Cercana Systems LLC*
Bill Dollins revisits his June geoMusings argument that vibe coding and AI pose a real threat to commercial software, with some companies more exposed than others. Five months of developments give him a chance to test that call against what's actually happened, which is the kind of follow-through most AI commentary skips.
→ [The Search for Equilibrium in the Software Market](https://cercanasystems.com/2026/11/the-search-for-equilibrium-in-the-software-market/)

**3. 4 strong Super El Niño flood events that defined October 2026** — *ICEYE Blog*
ICEYE's Solutions team analyzed nearly thirty flood events in October as the Super El Niño builds, including some in places expected to see less active weather. It's a vendor post, but it's an unusually direct view of how a SAR operator's flood monitoring gets used month to month.
→ [4 strong Super El Niño flood events that defined October 2026](https://www.iceye.com/blog/4-strong-super-el-ni%C3%B1o-flood-events-that-defined-october-2026)

**4. The Complexities and Ambiguities of the Tibetan Linguistic and Cultural Region** — *GeoCurrents*
Martin W. Lewis follows his piece on the plateau's political boundaries with its cultural geography, backed by census figures. About 86 percent of the Tibet Autonomous Region's population is ethnic Tibetan, but in Qinghai roughly half is Han Chinese and only around a quarter is Tibetan.
→ [The Complexities and Ambiguities of the Tibetan Linguistic and Cultural Region](https://www.geocurrents.info/blog/2026/11/24/the-complexities-and-ambiguities-of-the-tibetan-linguistic-and-cultural-region/)

**5. EAGLE course how to build QGIS plugins from scratch** — *Earth Observation News*
Two Würzburg EAGLE students walked classmates from zero to an installable QGIS plugin with a graphical interface. Their own hiking trail plugin fetches a DEM automatically, colors a route by slope and works out distance and walking time using the figures the DAV and ÖAV use to grade routes.
→ [EAGLE course how to build QGIS plugins from scratch](https://remote-sensing.org/eagle-course-how-to-build-qgis-plugins-from-scratch/)
