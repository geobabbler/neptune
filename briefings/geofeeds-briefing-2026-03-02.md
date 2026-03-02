# GeoFeeds Daily Briefing — Monday, March 2, 2026

*Covering posts from 0800 ET March 1 to 0800 ET March 2. Sources: 113 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Precision Positioning Moves Beyond GNSS**

Two announcements from Earth Imaging Journal bookend the positioning challenge. Point One Navigation and Cellnex are partnering to deploy centimeter-accurate RTK positioning infrastructure across Europe, explicitly targeting autonomous vehicles and robotics at continental scale. Meanwhile, Advanced Navigation launched Chimera Land, a 3D Laser Velocity Sensor designed for underground mining where GNSS signals can't reach. And from Australia, Spatial Source reported a $100 million CRC bid to harden the country's GNSS resilience against disruption.

*Why this matters:* Positioning is splitting into two simultaneous problems — extending precision where GNSS works, and inventing alternatives where it doesn't. The Australian CRC bid signals that governments now treat GNSS vulnerability as critical infrastructure risk, not just a technical inconvenience.

**2. FOSS4G NA 2025: A 20-Talk Archive Drops at Once**

Project Geospatial released recordings of over 20 sessions from FOSS4G NA 2025 in a single batch. The talks cover cloud-native geospatial infrastructure (STAC GeoParquet, Zarr vs. COG, DuckDB + rasters, GDAL's CLI redesign), applied GeoAI (scalable agents with knowledge graphs, LLMs meeting GIS), open-source community dynamics (teaching FOSS, open access publishing, dragging FOSS into closed-source shops), and applied work (Kentucky's open data migration to AWS, California parks mapping, remote sensing for hard-to-see plants).

*Why this matters:* This is the single largest dump of substantive open-source geospatial technical content in the feeds in months. The cloud-native infrastructure talks — particularly on Zarr, STAC GeoParquet, and DuckDB — address the persistent content gap around practical cloud-native geo tutorials.

**3. OGC Opens Individual Membership**

The Open Geospatial Consortium officially launched individual membership at its Philadelphia meeting. For the first time, engineers, developers, researchers, and students can participate directly in OGC working groups, code sprints, and the Agora collaboration platform without going through an organizational member. A 25% early-adoption discount runs through April 30.

*Why this matters:* OGC has historically been shaped by institutional members — large vendors and government agencies. Individual membership could bring more practitioner and independent voices into standards work, or it could remain a token gesture. The adoption rate in the first six months will tell the story.

---

## Top Five Posts

**1. At the Philadelphia Member Meeting, We Opened the Door Wider** — *Open Geospatial Consortium*
OGC's blog post on individual membership launch is worth reading for the framing, not just the announcement. It acknowledges that standards work has been gated by organizational access and positions this as a structural change. Whether it delivers depends on pricing and whether working group culture adapts to individual participants.
→ [Read on OGC](https://www.ogc.org/blog-article/ogc-individual-membership-launch/)

**2. CRC Bid to Shore Up Australia's GNSS Resilience** — *Spatial Source*
A $100 million Cooperative Research Centre bid focused on location and timing defenses. One of the rare posts in the ecosystem that covers sovereign positioning infrastructure investment at national scale — a concern that extends well beyond Australia as GNSS jamming and spoofing threats grow.
→ [Read on Spatial Source](https://www.spatialsource.com.au/crc-bid-to-shore-up-australias-gnss-resilience/)

**3. FOSS4G NA 2025: When LLMs Meet GIS — Jason Gilman** — *Project Geospatial*
Of the 20+ FOSS4G talks released, Jason Gilman's session on building reliable geospatial AI systems with LLMs stands out for addressing the practical integration challenges rather than the aspirational narrative. From Element 84, which ships production cloud-native geo infrastructure, not just demos.
→ [Listen on Project Geospatial](https://projectgeospatial.org/podcast-archive/geoint-2025-recap-karyn-hayes-ryan-shawana-johnson-amp-joe-calamari-tk5d2-sw87j-y5c7b-paxk7-jyadk-894rj-jplt7-zk483-a5n5m-2elh4-cgcsc-k4zzz-kzs3y-68x32-knd9b-nxyer-9n9yp-5jyys)

**4. FOSS4G NA 2025: Is Zarr the New COG — Jarrett Keifer & Julia Signell** — *Project Geospatial*
The Zarr vs. COG debate is one of the most consequential infrastructure questions in cloud-native EO right now, and this talk from two Element 84 engineers tackles it directly. Addresses a persistent content gap — the feeds discuss cloud-native formats philosophically but rarely provide technical depth.
→ [Listen on Project Geospatial](https://projectgeospatial.org/podcast-archive/geoint-2025-recap-karyn-hayes-ryan-shawana-johnson-amp-joe-calamari-tk5d2-sw87j-y5c7b-paxk7-jyadk-894rj-jplt7-zk483-a5n5m-2elh4-cgcsc-k4zzz-kzs3y-68x32-knd9b-nxyer-9n9yp-5jyys-jz7hd)

**5. Point One and Cellnex Partner on Centimeter-Accurate Positioning Across Europe** — *Earth Imaging Journal*
A concrete business partnership to deploy RTK positioning infrastructure at European scale, framed explicitly around autonomous vehicles and robotics. Notable because it names "Physical AI" as the demand driver — positioning infrastructure as a prerequisite for embodied AI systems, not just surveying or agriculture.
→ [Read on EI Journal](http://eijournal.com/news/business-2/point-one-and-cellnex-partner-to-accelerate-the-deployment-of-centimetre-accurate-positioning-infrastructure-across-europe)
