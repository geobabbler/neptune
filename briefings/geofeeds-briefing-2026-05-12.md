# GeoFeeds Daily Briefing — Tuesday, May 12, 2026

*Covering posts from 0800 ET May 11 to 0800 ET May 12. Sources: 160 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Gaussian Splatting Crosses the Measurement Threshold**

Gaussian splatting has been earning appreciation as a visualization technique for a while. Two posts in this window signal something different: it's now being embedded in production measurement pipelines on both the EO and photogrammetry sides. GeoSpatial ML's Caleb Robinson published a technically detailed post benchmarking Gaussian splatting for Sentinel-2 super-resolution — applying a coarse-to-fine LBFGS schedule to recover sub-10m detail from multi-temporal imagery — and grounded it explicitly in the commercial landscape (Planet SuperRes sharpens 3m to 2m; DigiFarm takes 10m Sentinel-2 to 1m; Vantor HD pushes 30cm to 15cm). Separately, a sponsored piece on Geo Week News covered PIX4D integrating Gaussian splatting into PIX4Dmatic, closing the loop between capture and measurement — not just rendering.

*Why this matters:* Gaussian splatting started as a visualization technique; it's now competing with deep-learning super-resolution and photogrammetric reconstruction pipelines. The representation-learning approach to imagery sharpening raises real questions about accuracy claims, methodology comparability, and where the technique fits relative to established photogrammetric standards.

---

**2. The QGIS 4.0 Adoption Curve: Practical Questions Arrive**

Nearly two months after the 4.0 Norrköping release, the ecosystem is moving from celebration to practical guidance. Jacky Volpes at Oslandia — a core QGIS developer — published a clear breakdown of the QGIS release cycle addressing the most common question now circulating: which version should I install? He lays out three distinct release types (dev, latest, LTR), their lifespans (24 hours / 4 months / 36 months), and the practical implications for choosing between latest and LTR. Separately, Open Geospatial Solutions released two tutorial videos showing how to connect QGIS to NASA's OPERA earth observation products via a dedicated plugin and an AI agent (OpenGeoAgent), demonstrating the third-party ecosystem building atop the 4.0 platform.

*Why this matters:* The version management question post-4.0 was predictable. Organizations evaluating whether to migrate on QGIS's LTR timeline need this kind of explicit infrastructure clarity, and the tutorial ecosystem is what converts a release into adoption. Oslandia stepping into the explanation gap early matters for enterprise uptake.

---

**3. Defining "Science-Grade" in EO — Positioning Move or Technical Standard?**

EarthDaily published a substantive blog post asking what makes earth observation data "science-grade" — arguing it's not primarily about resolution but about radiometric calibration, atmospheric correction, and metadata traceability. The implicit argument: commoditization is happening fast at the raw imagery level, but calibrated, analysis-ready data represents a defensible differentiation. TerraWatch's May 11 EO Essentials and Weekly Briefing, published in the same window, continue the same framing: EO value lies in the intelligence and quality layers above raw capture. This is a consistent positioning move across the supply side.

*Why this matters:* As more constellations come online and raw imagery prices compress, "science-grade" is becoming a moat argument more than a neutral technical descriptor. Who defines the standard — vendors, standards bodies, or downstream science users — has real implications for which EO products win in government and research procurement.

---

## Top Five Posts

**1. Gaussian Splat-based Satellite Image Super Resolution** — *GeoSpatial ML*
Caleb Robinson benchmarks Gaussian splatting for Sentinel-2 super-resolution with real technical rigor: coarse-to-fine LBFGS optimization, comparison against bicubic upsampling, and benchmarking against commercial products (Planet, DigiFarm, Vantor). Rare in the geospatial feed ecosystem for combining active research with explicit commercial context. The splat reconstructions visibly outperform bicubic and recover detail to the physical limit of the input data — a meaningful finding for EO practitioners thinking about super-resolution pipelines.
→ [Read it](https://geospatialml.com/posts/sentinel2-superresolution/)

**2. QGIS versions life cycle** — *Oslandia*
Core QGIS developer Jacky Volpes (Oslandia) explains the release cycle with rare clarity in the wake of 4.0: three version types, their stability and longevity characteristics, and what they mean for users who aren't sure whether to install the latest build or wait for an LTR. This is precisely the kind of authoritative, developer-side clarification that organizations need when evaluating a major version upgrade. Fills a real information gap, written by someone with direct platform knowledge.
→ [Read it](https://oslandia.com/en/2026/05/12/le-cycle-des-versions-de-qgis/)

**3. What Is 'Science-Grade' Earth Observation Data?** — *EarthDaily*
EarthDaily (a calibrated EO data provider) makes the case that science-grade means radiometric calibration and atmospheric correction traceability — not just resolution. It's a corporate blog post, but one worth reading critically: this is a supply-side actor making an explicit argument for why analysis-ready data (ARD) has durable value in a commoditizing market. The framing is useful regardless of whether you accept the conclusion. Read it alongside Spectral Reflectance's "Economics of Openness" from March for the structural context.
→ [Read it](https://earthdaily.com/blog/what-is-science-grade-earth-observation-data)

**4. Half Of European Municipalities Have Fewer Inhabitants Than 60 Years Ago** — *EarthStuff*
EarthStuff surfaces a CORRECTIV.Europe analysis built on JRC's ARDECO Local Population Time-Series (1961–2024): half of all European municipalities are smaller today than they were in 1961, with rural areas bearing the largest share of decline. The EU population peak is projected around 2029. EarthStuff links directly to the JRC dataset for those who want to work with the underlying data. Applied geographic analysis at a scale and with a dataset that genuinely fills a content gap — spatiotemporal demographic data outside the usual North American frame.
→ [Read it](https://earthstuff.substack.com/p/half-of-european-municipalities-have)

**5. OS Emergency Services Gazetteer** — *EarthStuff*
EarthStuff highlights Ordnance Survey's Emergency Services Gazetteer — a dataset specifically designed for non-addressed locations (bridges, river crossings, road junctions, open land) where emergency incidents occur but postal addressing doesn't help. Free for UK PSGA members. It's a practical dataset highlight rather than analysis, but one that cuts through the noise: the gazetteer addresses a genuine operational gap that most GIS practitioners would recognize immediately — not every emergency happens at an address. Relevant to anyone in UK public sector GIS, emergency services, or PSGA ecosystem.
→ [Read it](https://earthstuff.substack.com/p/os-emergency-services-gazetteer)
