# GeoFeeds Daily Briefing — Sunday, July 26, 2026

*Covering posts from 0800 ET July 25 to 0800 ET July 26. Sources: 162 geospatial feeds.*

---

Quiet day across the feeds — here are the highlights.

This was the thinnest window in recent memory. Two items crossed the wire in twenty-four hours: a Mappery photo and one blog post. Yesterday's window at least produced six. No independent Tier 1 voice posted, no vendor blog posted, no news outlet posted, and there was nothing resembling thematic convergence. A Saturday-to-Sunday summer window in the middle of the post-User-Conference lull is about as close to zero as this ecosystem gets.

The one substantive post is worth reading anyway.

---

## Highlights

**1. Alas, my Arc A770** — *Brian's Geek Blog*

A geospatial consultant walks through three generations of home ML hardware — a $200 secondhand Tesla P40, a Sparkle Arc Pro A770, and now Intel's reference Arc Pro B70 at roughly $1,000 — and explains why he keeps training and inference on his own machine rather than renting it. The reported numbers are specific: 27B- and 35B-class quantized models at around 30 tokens per second in agent workflows through Hermes and OpenCode, prompt processing sometimes near 2,500 tokens per second, and 256K-token context windows held in VRAM using a quantized KV cache. He is careful to label these as his own observations rather than benchmarks, notes that Vulkan currently outperforms SYCL on his system, and concedes NVIDIA's software maturity lead while arguing the price premium no longer earns itself for his workloads. The post ends with a full `llama.cpp` router configuration and the models he runs daily. It is also his first post since April 2025.

*Why this matters:* Agentic GIS coverage has been almost entirely about integration surfaces — MCP, plugins, tool contracts. This is the layer underneath: what the hardware actually costs a one-person consultancy, and whether keeping client data off hosted inference is affordable. That is the sovereignty argument at practitioner scale, and nobody else in the feeds is writing it.

→ [Read the post](https://brian.digitalmaddox.com/blog/?p=854)

---

*Filtered from this window: one Mappery photo post. The GeoFeeds briefing feed is excluded by policy.*
