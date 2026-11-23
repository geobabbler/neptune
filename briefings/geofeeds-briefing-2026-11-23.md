# GeoFeeds Daily Briefing — Monday, November 23, 2026

*Covering posts from 0800 ET November 22 to 0800 ET November 23. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Faster Tiles, Stricter Checks**

Two open-source releases went after the unglamorous middle of the pipeline. Spatialists flagged manby, Birk Skyum's Rust-based drop-in alternative to tippecanoe. It turns GeoParquet, GeoJSON, DuckDB queries and more into vector tiles, and benchmarks put it eight to eighteen times faster. It ships with Python and R bindings. Oslandia released QompliGIS 2.0, the QGIS plugin it launched in 2021 for checking whether delivered data matches a specification. Fields can now carry minimum and maximum values, relational constraints between two tables and regular expressions on text. Checking compliance no longer needs the original reference dataset, because a single configuration file holds the coordinate system, the expected files and fields, and minimum and maximum areas and lengths. David G. Smith supplied a reminder that old tools stick around. While updating a home lab full of Coolify, containers, code-server and Ollama models, Smith still did most of the work in Midnight Commander.

*Why this matters:* Cloud-native geo's format layer is settled enough that the tooling around it now competes on speed and ergonomics. A fast GeoParquet-to-tiles path closes a real gap. QompliGIS handles the quieter problem, making sure data delivered against a spec actually meets it before anyone builds on it.

**2. Names, Units and Who Gets to Set Them**

The Map Room picked up a follow-up reel from Alex at GateNerd on "Gulf of America." Apple and Google say they use the name to follow U.S. Board on Geographic Names guidelines that favor conventional names over variant ones, and GateNerd points out an inconsistency in that rationale. It follows a November 16 post asking whether the renaming was technically illegal, and October's news that Alabama now requires state entities and employees to use it. Spatialists flagged a Public Data Lab policy brief mapping the spatial units used across Switzerland and the canton of Zurich, from communes and districts to MS regions and statistical quarters. Spatial Source reported that Kadastre is expanding into New South Wales with an eye on upcoming NSW Land Registry Services survey plan lodgement requirements. It also covered Indonesian Vice Admiral Dr Budi Purwanto receiving the Alexander Dalrymple Award for services to international hydrography and cartography.

*Why this matters:* Names and boundaries look like reference data, but they're policy. Platform naming is the sovereignty debate at its most consumer-facing. Swiss regionalisations and NSW lodgement rules are the institutional version, where the choice of polygon quietly shapes every analysis built on top of it.

**3. Inventories Built Over Decades**

Spatial Source reported that Finland's forest database has grown to cover 8.5 billion trees across 29 million hectares, making it one of the largest in the world. At a much smaller scale, a guest post on geoObserver by Sven Schröter of NETGIS described the Kulturdatenbank Region Trier, which volunteers have been building since 1992. It holds 50,024 cultural objects and more than 51,000 images across 555 municipalities, from churches and wayside crosses to Roman sites, field names, maars, mills and Stolpersteine. Every object was precisely located from the start, years before the database went online in 1998. Co-founder Peter Valerius was a cartographer with the regional planning association, and to him a wayside cross without a coordinate was only half the information. Spatial Source also ran thermal infrared images from Sentinel-3C showing Western Australia's deserts and the seas off its north-western coast. The satellite launched alongside FLEX on September 15.

*Why this matters:* Forestry and cultural heritage rarely show up in feeds that lean toward government and defense. Trier's volunteers geocoded everything decades before "open data" was a slogan, a useful counterpoint to the current worry about who sustains community datasets. Persistence, not novelty, is what made both inventories valuable.

---

## Top Five Posts

**1. manby: Fast vector tiles** — *Spatialists – geospatial news*
A short post about a tool that could change a lot of daily workflows. manby is a Rust drop-in replacement for tippecanoe that reads GeoParquet, GeoJSON and DuckDB queries directly, with benchmarks showing eight to eighteen times the speed. The Python and R bindings make it reachable for analysts who never touch a command line.
→ [manby: Fast vector tiles](https://spatialists.ch/posts/2026/11/23-manby-fast-vector-tiles/)

**2. 50.000 Kulturobjekte, alle verortet: die Kulturdatenbank Region Trier – ein Gastbeitrag** — *#geoObserver*
A first-hand account of a volunteer heritage database that has grown to 50,024 georeferenced objects across 555 municipalities since 1992. Sven Schröter, who has looked after it for nearly 20 years, knows of no comparable cultural heritage dataset in Germany built entirely by citizen volunteers. It's in German and worth the translation.
→ [50.000 Kulturobjekte, alle verortet: die Kulturdatenbank Region Trier – ein Gastbeitrag](https://geoobserver.de/2026/11/23/50-000-kulturobjekte-alle-verortet-die-kulturdatenbank-region-trier-ein-gastbeitrag/)

**3. QompliGIS 2.0: New features for validating your geographic data** — *Oslandia*
Concrete detail on how to validate a dataset against a specification inside QGIS, including min/max, cross-table and regex constraints on attributes. The change that lets a configuration file stand alone without the reference dataset matters most for anyone receiving data from contractors.
→ [QompliGIS 2.0: New features for validating your geographic data](https://oslandia.com/en/2026/11/23/qompligis-2-0-de-nouvelles-fonctionnalites-pour-valider-vos-donnees-geographiques/)

**4. Are They Following the Guidelines or Not?** — *The Map Room*
The latest in The Map Room's running coverage of "Gulf of America," this time on whether Apple's and Google's appeal to Board on Geographic Names guidelines holds up. It's a useful case study in how platform mapmakers justify naming decisions.
→ [Are They Following the Guidelines or Not?](https://www.maproomblog.com/2026/11/are-they-following-the-guidelines-or-not/)

**5. Mapping 8.5 billion trees over 29 million hectares** — *Spatial Source*
Finland's national forest database now covers 8.5 billion trees, which puts it among the largest in the world. It's a rare look at forest inventory at national scale, the kind of forestry work these feeds seldom carry.
→ [Mapping 8.5 billion trees over 29 million hectares](https://www.spatialsource.com.au/mapping-8-5-billion-trees-over-29-million-hectares/)
