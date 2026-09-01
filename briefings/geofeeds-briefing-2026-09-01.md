# GeoFeeds Daily Briefing — Tuesday, September 1, 2026

*Covering posts from 0800 ET August 31 to 0800 ET September 1. Sources: 166 geospatial feeds.*

---

## Three Topics That Stood Out

**1. EO's business keeps moving from pixels to payouts**

SIIS and SkyFi announced a partnership putting native 25cm SpaceEye-T optical imagery and tasking on SkyFi's marketplace, opening high-resolution capacity to a global customer base rather than a single buyer, per Spatial Source and Earth Imaging Journal. Separately, EarthDaily struck a new agreement with an unnamed North American property and casualty insurer to run its AI-driven wildfire risk intelligence across high-risk Western US markets.

*Why this matters:* EO's real money is in the diagnosis, not the picture. EarthDaily's wildfire deal with a major insurer is a rare commercial-vertical win in a discourse that talks endlessly about agriculture and insurance while barely ever landing a named contract with either. Imagery-as-commodity keeps getting confirmed from a different direction.

**2. European space and geospatial institutions keep building capacity**

Teledyne Space Imaging's CIS111 detector launched aboard the MTG-I2 geostationary weather satellite as part of its Flexible Combined Imager, per Geoconnexion. The same day, ESA awarded PLD Space a €158.9 million contract to develop its next-generation MIURA Next launcher, and EuroGeographics opened a new Observer Membership framework to widen international geospatial collaboration.

*Why this matters:* Europe's space buildout keeps moving from op-ed to contract, and it's not just launch vehicles and constellations. A meteorological instrument reaching orbit, a launcher contract award, and a widened institutional membership all landed the same week, evidence the sovereignty conversation now spans hardware, funding, and governance at once.

**3. Practitioners keep solving the unglamorous production problems**

An Earth observation engineer detailed on Medium how redesigning for Spot instance failure, not just choosing Spot pricing, cut EC2 compute costs by roughly 70% on a large parallel processing workload. vGIS published a practitioner explainer on why EPSG codes and State Plane coordinate systems still delay projects moving between surveyors, engineers, and CAD platforms, and Fulcrum described how AI-assisted development now lets environmental consulting firms encode their own field workflows into custom Wildnote extensions without hiring a developer.

*Why this matters:* None of this is glamorous, but it's the layer flashy AI demos are eventually built on top of. Spot-instance resilience, coordinate system plumbing, and AI-assisted custom app building are three different practitioners solving the same underlying problem: production geospatial work is unforgiving of shortcuts.

---

## Top Five Posts

**1. We Cut EC2 Compute Costs by ~70% — By Designing for Failure, Not Just Choosing Spot** — *Earth Observation on Medium*
A practitioner walks through cutting Earth observation compute costs by roughly 70% using Terraform, SQS, and interruption-aware EC2 Auto Scaling workers built to survive Spot instance interruptions rather than just chase Spot pricing. It's a concrete architecture writeup, not a vendor pitch, for anyone running large parallel EO processing jobs on a budget.
→ [Read it](https://medium.com/%40sraza0098/we-cut-ec2-compute-costs-by-70-by-designing-for-failure-not-just-choosing-spot-06adee8c888d?source=rss------earth_observation-5)

**2. Coordinate Systems and Why They Still Cause Delays on Design Projects** — *vGIS*
vGIS breaks down why EPSG codes and State Plane coordinate systems still trip up projects moving data between surveyors, engineers, GIS staff, and CAD platforms. It's a practical explainer on a problem every multi-discipline project eventually hits, not a new feature announcement.
→ [Read it](https://www.vgis.io/2026/08/31/coordinate-systems-and-why-they-still-cause-delays-on-design-projects/)

**3. EarthDaily Expands AI-Powered Wildfire Risk Intelligence Across the Western U.S. With North American Insurance Major** — *Earth Imaging Journal*
EarthDaily details a new agreement with an unnamed North American property and casualty insurer to deploy its AI-driven, satellite-based wildfire risk intelligence across high-risk markets in the Western US. Named insurance-sector customer deals are rare in these feeds, making this one of the few concrete demand-side EO stories to point to.
→ [Read it](https://eijournal.com/news/products-2/earthdaily-expands-ai-powered-wildfire-risk-intelligence-across-the-western-u-s-with-north-american-insurance-major)

**4. Annual High-Resolution Global Ambient Population Estimates From 1975 To 2024** — *EarthStuff*
EarthStuff flags a new open dataset and paper delivering annual, high-resolution global ambient population estimates from 1975 through 2024, tied to the LandScan Mosaic Time Series. It's the kind of dataset release, buried in a DOI link, that's easy to miss and genuinely useful for anyone doing population-weighted spatial analysis.
→ [Read it](https://earthstuff.substack.com/p/annual-high-resolution-global-ambient)

**5. Senegal Répertoire des localités** — *Revolutionary GIS*
Revolutionary GIS points to an open GitHub dataset cataloging Senegal's localities and settlements alongside 2023 population figures. It's a terse post, but a genuinely usable resource in a region the feed ecosystem otherwise covers thinly.
→ [Read it](https://revolutionarygis.wordpress.com/2026/08/31/senegal-repertoire-des-localites/)
