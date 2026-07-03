# GeoFeeds Daily Briefing — Friday, July 3, 2026

*Covering posts from 0800 ET July 2 to 0800 ET July 3. Sources: 113 geospatial feeds.*

---

## Three Topics That Stood Out

**1. MCP keeps widening past GIS desktop tools, into data vendors**

Safe Software published a detailed walkthrough on turning FME workspaces into MCP tools — swap the writer, publish to FME Flow, register the parameters, and any MCP-capable client can invoke the transformation. The same day, Vexcel announced Vexcel MCP, making its aerial imagery and geospatial data directly queryable inside Claude, ChatGPT, Copilot, and Gemini.

*Why this matters:* The Agentic GIS/MCP thread keeps maturing from experiment toward production. As FME and now an imagery vendor expose MCP endpoints, the practical question shifts from whether agents can reach GIS tools to which of the growing surfaces an organization should standardize on.

**2. Applied climate and biodiversity science crowded the feeds**

EarthStuff surfaced two papers — one showing flood modeling on Ireland's historic masonry bridges projects load-capacity reductions of up to 40% under extreme flood events, another introducing a Sentinel-1/Sentinel-2 hybrid index for detecting European farming practices like tillage and sowing. Spatial Source added modelling showing fast-growing cities are outpacing the "critical speed limit" for retaining plant communities, plus a report on Pacific Islands using EO data for coastal ecosystem conservation.

*Why this matters:* This is the kind of applied, decision-relevant geospatial science the feeds structurally under-cover — infrastructure resilience, farm-level monitoring, biodiversity — rather than tooling or product announcements. Four outlets converging on climate-adjacent applications in one day is unusual against the industry's usual EO/GeoAI hype-cycle framing.

**3. Two substantive how-to pieces chip away at chronic content gaps**

GoGeomatics published a comprehensive practical guide to handheld SLAM scanning, noting how little guidance exists despite SLAM becoming standard kit for surveyors. Sparkgeo's Kaela Hayes wrote about abandoning local imagery downloads for a JupyterLab workflow querying City of Calgary Sentinel-2 imagery directly from cloud storage.

*Why this matters:* LiDAR/point-cloud workflows and practical cloud-native tutorials are two of the feeds' most persistent content gaps. Two substantive how-to pieces landing the same day — one on capture, one on cloud-native analysis — is a small but real signal the tutorial gap may be narrowing.

---

## Top Five Posts

**1. Turning FME Workspaces into MCP Tools: Connecting ArcGIS to AI** — *FME Blog (Safe Software)*
Safe Software lays out the actual mechanics of exposing an FME workspace as an MCP tool, down to why tool descriptions — not the workspace logic itself — determine whether an agent calls it correctly. Rare specificity in a conversation that's mostly aspirational.
→ [Read on FME Blog](https://fme.safe.com/blog/2026/07/turning-fme-workspaces-into-mcp-tools-connecting-arcgis-to-ai/)

**2. Vexcel Brings Aerial Imagery and Geospatial Intelligence to AI Platforms** — *Earth Imaging Journal*
Vexcel's new MCP server puts its aerial imagery and geospatial data directly inside Claude, ChatGPT, Copilot, and Gemini — a data vendor, not just a software vendor, adopting the MCP pattern. One more data point on how fast MCP is spreading past desktop GIS.
→ [Read on Earth Imaging Journal](https://eijournal.com/news/products-2/vexcel-brings-aerial-imagery-and-geospatial-intelligence-to-ai-platforms)

**3. A Practical Handheld SLAM Scanning Guide** — *GoGeomatics*
Gavin Schrock notes that despite handheld SLAM becoming standard kit for surveyors and reality-capture practitioners, few practical guides exist — this one fills a real void with hands-on workflow detail rather than another capability announcement.
→ [Read on GoGeomatics](https://gogeomatics.ca/slam-guide/)

**4. From Bogged Down to On the Fly** — *Sparkgeo*
Kaela Hayes recounts trading folder-hunting and multi-gigabyte downloads for a JupyterLab workflow querying City of Calgary Sentinel-2 imagery straight from cloud storage. A first-person account of the cloud-native promise actually working, not just being pitched.
→ [Read on Sparkgeo](https://sparkgeo.com/blog/from-bogged-down-to-on-the-fly/)

**5. New Zealand's new coastal LiDAR data milestone** — *Spatial Source*
The second phase of New Zealand's 3D Coastal Mapping program is complete, adding 118 billion point-cloud data points to the public record — a concrete, large-scale applied LiDAR project of the kind the GeoAI hype cycle rarely produces deployed equivalents of.
→ [Read on Spatial Source](https://www.spatialsource.com.au/new-zealands-new-coastal-lidar-data-milestone/)
