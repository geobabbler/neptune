# GeoFeeds Daily Briefing — Friday, November 13, 2026

*Covering posts from 0800 ET November 12 to 0800 ET November 13. Sources: 168 geospatial feeds.*

---

## Three Topics That Stood Out

**1. Does the Model Travel?**

The AI talk in this window was about whether models hold up away from home. Earth Observation News reported two EAGLE master's theses defended on November 12, and both took on the same problem: models trained in one city lose much of their accuracy in another. Christina Krause started from frozen DINOv2 features and street-level imagery to classify building types for seismic risk, using LoRA adaptation on Santiago de Chile and active learning of labels in Lima. Marlene Bauer tested informal settlement mapping across 12 cities in Africa, Asia and Latin America, scoring each model on a city it had never seen and estimating how far each prediction can be trusted. Esri published a guide to prompt writing for AI assistants. At FOSS4GNA, North River Geographic Systems admitted to being behind on AI and quoted an attendee comparing it to Docker a decade ago.

*Why this matters:* Cross-city transfer is the test most GeoAI demos skip. Two theses that measure it, uncertainty included, are closer to deployed evidence than most vendor posts. The Docker comparison fits too. Docker stopped being a talking point once it became plumbing, and AI in GIS looks headed the same way.

**2. QGIS Grows From the Edges Inward**

#geoObserver noted that the QGIS plugin site now lists 4516 approved plugins and pointed to a list of plugins useful enough to be absorbed into the QGIS core. The list records when each one moved in. The OpenLayers plugin, for instance, joined the core in QGIS 2.18 in October 2016 after almost 4 million downloads. OPENGIS.ch wrote up its October Hackfest in Laax, the village where the company is based and where QField was born. This year Laax also hosted the QGIS User Conference and the 29th QGIS Contributor Meeting, organised with the Swiss QGIS user group. The post describes QField as what happens when a community spends two decades building desktop GIS in the open and then takes it outside. Every form and symbol a field worker sees on their phone is drawn by the QGIS rendering engine. Both posts trace the same path, from add-on to platform.

*Why this matters:* Plugins work as QGIS's R&D lab, with downloads acting as the market signal for what belongs in core. AI agent plugins will test that model. The sovereignty debate keeps asking who controls geospatial infrastructure, and here part of the answer is a contributor meeting in a Swiss village.

**3. Whose Knowledge Is on the Map**

The Map Room pointed to Thomas J. Bassett's piece in The Conversation debunking a myth about European maps of Africa. His research on colonial-era mapping of West Africa shows that much of the geographical information on those maps was based on African sources. Open-Source Solutions for Geospatial Analysis ran a cartography post pegged to Sterling Quinn under the title "cartographies of silence." Bauer's thesis belongs here too. Mapping informal settlements across 12 cities in the Global South targets places that official datasets tend to capture poorly, and her models report how much each prediction can be trusted rather than presenting a clean answer. Brilliant Maps shared a world map of where people keep their shoes on indoors, then conceded that reality is considerably more complicated, often down to family tradition and regional custom. Each piece asks who supplied the knowledge and what the map flattens.

*Why this matters:* This feed ecosystem skews North American and European, and these posts are a reminder that the skew is old. Maps have long turned local knowledge into outside authority. Uncertainty-aware models of Global South cities are one honest way to avoid repeating that.

---

## Top Five Posts

**1. Successful MSc Defense by Christina Krause** — *Earth Observation News*
Krause's thesis tests two practical levers for moving a building-type classifier from Santiago de Chile to Lima, LoRA adaptation and active learning, on top of frozen DINOv2 features. It's a concrete look at the cost of labelling every new city, framed around seismic risk assessment.
→ [Successful MSc Defense by Christina Krause](https://remote-sensing.org/successful-msc-defense-by-christina-krause/)

**2. Successful MSc Defense by Marlene Bauer** — *Earth Observation News*
Bauer evaluated deep learning models for informal settlement mapping across 12 cities in Africa, Asia and Latin America, always testing on a city the model never saw in training. The focus on prediction uncertainty makes it more useful than a single accuracy score.
→ [Successful MSc Defense by Marlene Bauer](https://remote-sensing.org/successful-msc-defense-by-marlene-bauer/)

**3. Who Mapped Africa?** — *The Map Room*
The Map Room surfaces Thomas J. Bassett's argument that colonial-era maps of West Africa leaned heavily on African geographic knowledge. It's a short pointer to research that reframes who the real mapmakers were.
→ [Who Mapped Africa?](https://www.maproomblog.com/2026/11/who-mapped-africa/)

**4. FOSS4GNA 2026 – Post1 – Toasters** — *North River Geographic Systems Inc*
A candid conference reflection from a longtime open-source practitioner who admits to being behind on AI and passes along the comparison to Docker's hype ten years ago. It also gets personal about what keeps someone in this work, which is rare in these feeds.
→ [FOSS4GNA 2026 – Post1 – Toasters](https://www.northrivergeographic.com/foss4gna-2026-post1-toasters/)

**5. QGIS: In den Kern integrierte Plugins** — *#geoObserver*
A quick German-language pointer to the list of plugins that have been folded into the QGIS core, with dates showing when each moved in. Useful for anyone who still installs a plugin that QGIS already ships.
→ [QGIS: In den Kern integrierte Plugins](https://geoobserver.de/2026/11/13/qgis-in-den-kern-integrierte-plugins/)
