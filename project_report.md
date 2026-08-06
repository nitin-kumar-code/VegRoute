# VegRoute
## Graph-Based Vegetarian Restaurant Discovery and Navigation System for Agartala
### Semester Project Report — Graph Theory (3rd Semester, B.Tech CS)

---

## 1. Executive Summary

VegRoute is proposed as a semester project that models the road network and restaurant landscape of Agartala as a weighted graph, then applies classical and modern graph algorithms to solve two linked problems: (a) **discovery** — helping a person find vegetarian-friendly dining options that match their exact dietary strictness, and (b) **navigation** — routing them there efficiently, and optionally through a multi-stop "vegetarian food trail." The project is deliberately scoped so that every user-facing feature maps onto a specific, teachable graph-theory concept (shortest path, minimum spanning tree, graph traversal, clustering, centrality, the Travelling Salesman Problem), which makes it both a genuine local utility and a strong academic demonstration piece.

This report researches the competitive landscape, isolates the specific gap VegRoute would fill, surveys the algorithms real navigation systems use, maps those algorithms and other graph-theory concepts onto VegRoute's features, proposes a software architecture, and evaluates feasibility and academic fit.

---

## 2. Problem Statement

Agartala, the capital of Tripura, sits in a part of India where the two large forces shaping food-tech products — dense restaurant supply and large vegetarian demand — are both comparatively weak. National Family Health Survey data (NFHS-5, 2019–21) shows that across the northeastern states (Tripura included), only about 1.3–1.6% of the population reports never eating meat, versus a national average many times higher and figures above 50–70% in states like Rajasthan, Haryana, and Gujarat. Tripura is explicitly flagged in nutrition literature as a "primarily non-vegetarian" hill state. This means:

- Vegetarian eaters in Agartala are a small, geographically scattered minority rather than a market large enough for national platforms to invest listing effort in.
- The restaurants that do offer genuine vegetarian options are not clustered into an obvious "veg district" the way they might be in a high-vegetarian city — they are needles scattered in a haystack.
- The people who need this most are a specific, identifiable set: interstate students and government/defence/bank/railway employees posted from high-vegetarian states, Marwari and Gujarati trading families settled locally, ISKCON/Vaishnavite devotees, Jain households, and health- or religion-driven vegetarians — plus tourists.

A discovery-and-routing problem where the "matching" targets are sparse and unevenly distributed over a real road network is precisely the kind of problem graph theory is built to formalize: it is not just a filtered list, it is a weighted-graph search problem.

---

## 3. Landscape of Existing, Similar Applications

### 3.1 HappyCow (global vegan/vegetarian discovery)
HappyCow is the dominant global app in this exact niche — over 25 years old, with roughly 220,000–250,000 listings across 180+ countries, filters for vegan/vegetarian/gluten-free/raw, an interactive "hidden gem" map, and a large user review base. Its model is a curated global directory with community-submitted listings and reviews, browsable through search and filters, plus offline saving for travel.

*Relevance to Agartala:* HappyCow's coverage is crowd-submission-driven, and crowd submissions correlate strongly with vegan/vegetarian community density. Given Tripura's ~1–2% vegetarian population, Agartala listings on HappyCow are, in practice, sparse to nonexistent compared to Delhi, Mumbai, Ahmedabad, or global vegan hubs.

### 3.2 Zomato and Swiggy (Indian food delivery/discovery)
Zomato introduced a dedicated "Veg Mode" (initially "Pure Veg Mode," later renamed after public debate over an associated "Pure Veg Fleet") that lets a user filter the whole app to show either vegetarian dishes from all restaurants, or only restaurants that are 100% vegetarian. Zomato's own leadership framed this as a response to a common piece of user feedback: vegetarian customers care not just about the dish but about how and where it was prepared (cross-contamination, shared kitchens, shared cooking oil/utensils). This is an important, India-specific insight: "vegetarian" in the Indian context is often about **kitchen purity**, not just menu labeling — a nuance global apps like HappyCow do not model at all.

*Relevance to Agartala:* Zomato/Swiggy's "veg mode" is a **database filter on a delivery catalogue**, not a navigation or discovery tool for a sparse, low-supply city. It depends on the restaurant already being onboarded to the platform with a delivery menu — a much higher bar in a Tier-3 city than simply existing as a walk-in eatery.

### 3.3 General-purpose maps and navigation (Google Maps, Mappls/MapmyIndia, OpenStreetMap-based apps)
Google Maps and Mappls (formerly MapmyIndia) are the general routing layer most people in Agartala already use. Mappls is specifically noted as having the most comprehensive Indian local data, including village-level and rural roads that Google under-maps, and is used by the Indian government and several vehicle manufacturers. OpenStreetMap (OSM)-based apps (OsmAnd, Maps.me) provide free offline routing and reportedly have "excellent" city coverage in India, improving in the Northeast. A direct look at OSM edit history for Agartala shows recent contributor activity explicitly aimed at fixing "poorly mapped roads around Agartala" — i.e., the base map data is usable but has historically needed real cleanup work, which is itself a relevant, honest feasibility signal for this project.

*Relevance to Agartala:* These tools solve **routing** extremely well (turn-by-turn, real road topology) but have **no concept of "vegetarian" as a semantic filter on top of the routing graph** — a search for "restaurant" returns everything, with dietary status buried (if present at all) in unstructured review text or missing entirely for small local eateries.

### 3.4 Local directories (Google Business listings, Justdial-style directories)
These provide phone numbers, addresses, and sometimes categories/photos for local businesses, including small eateries that never appear on Zomato/Swiggy. Coverage of small Tier-2/3 town eateries is often better here than on food-delivery apps, but there is no graph-based routing, no multi-stop planning, and dietary-purity tagging is inconsistent or absent.

---

## 4. Problems These Existing Applications Solve

- **HappyCow** solves *global, community-verified vegan/vegetarian discovery for travelers*, with strong review trust in cities where the vegan/vegetarian community is active.
- **Zomato/Swiggy "Veg Mode"** solves *fast, in-app filtering of an existing delivery catalogue*, and directly addresses the India-specific concern about shared-kitchen contamination for large-city users who already have many onboarded restaurants to choose from.
- **Google Maps/Mappls/OSM apps** solve *accurate, fast, real-time-aware point-to-point and turn-by-turn routing* across essentially the entire Indian road network, including smaller cities like Agartala.
- **Local directories** solve *bare existence-and-contact-info discovery* for small businesses that never make it onto app-based platforms.

Each of these is a genuinely hard, well-solved problem in its own domain.

---

## 5. Problems These Existing Applications Do Not Solve (The Gap)

1. **No dietary-purity-aware routing graph.** None of the routing platforms (Google Maps, Mappls, OSM apps) treat "vegetarian" as an edge/node attribute that can be optimized over — you cannot ask any of them for "the shortest route that passes only through pure-veg-verified stops." Vegetarian status, where present, is an unstructured label on a place, never a first-class part of the route-planning graph.
2. **No multi-stop vegetarian trail planning.** Nobody offers a "vegetarian food crawl" feature — visit N vegetarian-verified spots in a city in a near-optimal order. This is a direct, teachable instance of the Travelling Salesman / vehicle-routing family of problems.
3. **Sparse Tier-2/3 city coverage in dietary-focused apps.** HappyCow's coverage correlates with vegetarian community size; Tripura's vegetarian population is only ~1.3–1.6%, so Agartala is structurally under-covered by a platform whose data model depends on community submissions from that same small population.
4. **No graded "purity" model.** Real vegetarian dietary needs in India are not binary. There is a spectrum: strict Jain (no onion/garlic/root vegetables), ISKCON/Vaishnav-satvik, lacto-vegetarian, "vegetarian dish available but same kitchen as non-veg," egg-inclusive, etc. Zomato's veg mode only distinguishes "veg dish from any restaurant" vs. "veg dish from a 100%-veg restaurant" — a coarse, two-level version of a problem that is naturally modeled as a richer graph/attribute space.
5. **No locally-adapted, offline-friendly discovery+routing bundle.** In a smaller city with patchier connectivity than a metro, a lightweight app that combines *both* discovery and routing (rather than requiring HappyCow for discovery and a separate app for turn-by-turn navigation) is itself a usability gap, not just an algorithmic one.
6. **No network-level insight for the city itself.** No existing tool answers structural questions like "which neighborhood is currently a vegetarian food desert," "which vegetarian restaurant is most central/reachable from the rest of the city," or "what is the minimum-cost set of roads that would need attention to connect all known veg-friendly spots" — questions that are natural once the city is represented as a graph, but that a plain listings app was never designed to answer.

This gap — not raw routing, and not raw listings, but the **combination of a dietary-purity attribute layer with graph-based route and tour optimization**, specifically undersupplied in a low-vegetarian-density Tier-3 city — is the real, defensible niche for VegRoute.

---

## 6. Why a Dedicated Vegetarian Navigation System Is Useful for Agartala

- **The minority-density argument.** Counter-intuitively, a *low* vegetarian population percentage makes a discovery-and-routing tool *more* valuable, not less: when a resource is common and evenly spread (as in Ahmedabad or Jaipur), you barely need a tool to find it. When it is rare and scattered (as in Agartala), the search cost is exactly the kind of "shortest path to nearest matching node in a sparse graph" problem that graph algorithms are designed to minimize.
- **Identifiable, real user groups.** Interstate students (a very large group, since Tripura hosts NIT Agartala, Tripura University, medical/engineering colleges with pan-India admissions), transferred central-government/bank/railway/defence employees, Marwari/Gujarati trading-community households, ISKCON and Jain communities, and tourists (Agartala is a gateway to Tripura's palaces and to Bangladesh via the Akhaura land border) are all groups with a standing, recurring need this app would serve.
- **Real, non-trivial road topology.** Tripura is a hilly state connected to the rest of India by essentially one lifeline highway (NH-44), and Agartala itself has had to add infrastructure such as its first flyover to manage traffic — meaning the city's road graph has genuine structure (bottlenecks, one-way segments, a single flyover corridor) worth modeling rather than a trivial grid, which strengthens the case for applying real shortest-path algorithms instead of straight-line distance.
- **Civic and cultural utility beyond the algorithm.** In India, "vegetarian" is frequently a marker of specific dietary/religious practice (kitchen purity, cross-contamination concerns), a concern serious enough that a company the size of Zomato built and then had to publicly walk back parts of a dedicated feature for it. A smaller, locally scoped, non-commercial student project can meet this same underlying need for Agartala's specific minority community without the commercial and social controversy that entangled Zomato's rollout — a useful point to be aware of when discussing "real-world sensitivities" in a project defense/viva, without needing to take a position on that controversy.

---

## 7. Existing Graph Algorithms Used in Real Navigation Systems

A software-architect-level survey of what production routing systems actually use, from simplest to most industrial:

| Algorithm | What it does | Where it's used |
|---|---|---|
| **Breadth-First / Depth-First Search (BFS/DFS)** | Explores a graph level by level or path by path; BFS gives shortest path in *unweighted* graphs | Foundational; used for connectivity checks, reachability, building smaller sub-graphs |
| **Dijkstra's Algorithm (1956/1959)** | Single-source shortest path on a non-negative-weighted graph, using a priority queue to always expand the currently-nearest unvisited node | The historical backbone of GPS route calculation; still the reference algorithm every navigation system is compared against |
| **A\* Search** | Dijkstra plus a heuristic (e.g., straight-line/Euclidean distance to the goal) that focuses the search toward the destination instead of expanding equally in all directions | Used in Google Maps-class systems and game/robot pathfinding; faster than plain Dijkstra when a good heuristic exists |
| **Bellman-Ford** | Single-source shortest path that tolerates negative edge weights (Dijkstra cannot) at the cost of being slower | Useful when "weight" isn't pure distance — e.g., a modified Bellman-Ford has been proposed in travel-recommendation research to combine distance with soft factors like fatigue or point-of-interest proximity, some of which can behave like negative adjustments |
| **Floyd–Warshall** | All-pairs shortest paths in one pass over the whole graph | Impractical for continent-scale road networks, but entirely practical for a single mid-sized city graph like Agartala's, and useful for precomputing "distance from every veg restaurant to every other" |
| **Bidirectional Dijkstra/A\*** | Runs the search simultaneously from both the source and the destination, meeting in the middle | Cuts search space dramatically; a standard production optimization |
| **Contraction Hierarchies (CH)** | A preprocessing technique that ranks road-network nodes by "importance" and inserts precomputed shortcut edges, so that live queries only need to touch a small fraction of the graph | The core technique behind OSRM (Open Source Routing Machine) and used, in variants, by GraphHopper and other production routing engines to answer nationwide/continental queries in milliseconds |
| **Customizable Route Planning / Customizable Contraction Hierarchies** | Splits preprocessing into a metric-independent structural phase and a fast metric-specific "customization" phase, so live traffic weights can be swapped in quickly | Used in industry-grade systems that need real-time traffic-aware rerouting without redoing all preprocessing |

The key architectural insight from this survey, and the single most important thing to state confidently in a viva: **modern production systems don't use "pure" Dijkstra or A\* directly on the full planet-scale graph.** They use Dijkstra/A\* as the *querying* algorithm on top of a much smaller, precomputed graph produced by a speed-up technique like Contraction Hierarchies. VegRoute, operating at city scale rather than planet scale, can legitimately use plain Dijkstra/A\* directly (a graph of a few thousand Agartala road nodes is trivially small for it), while still *discussing* Contraction Hierarchies as the "next step if this scaled to the whole Northeast region" — this is exactly the kind of real-world-grounded design trade-off a graph theory course wants to see articulated.

---

## 8. Which Graph Theory Concepts Fit VegRoute

This is the heart of the project — mapping every user-facing feature to a specific, defensible graph-theory concept.

**8.1 The city as a weighted graph.**
Nodes = road intersections/junctions (plus special POI nodes for each restaurant, snapped to the nearest road segment). Edges = road segments, weighted by a combination of distance and estimated travel time. Since some Agartala roads may be one-way (especially around the flyover corridor), edges should be modeled as **directed**, making the underlying structure a weighted directed graph, not a simple undirected one.

**8.2 Shortest path — Dijkstra/A\* — for point-to-point navigation.**
The core "take me to the nearest pure-veg restaurant" or "route me to this specific restaurant" feature is a textbook single-source shortest-path problem. A\* with a straight-line-distance heuristic is the natural choice once real coordinates are available, since it converges faster than plain Dijkstra without sacrificing correctness (both guarantee the optimal path on non-negative weights).

**8.3 Multi-criteria / weighted shortest path for "purity-aware" routing.**
Rather than a single distance weight, each candidate destination (and optionally each edge, if walking through certain areas is undesirable) can carry a composite score combining distance/time with a "vegetarian confidence score" (see 8.7). This turns plain shortest-path into a weighted optimization where the "cost" function itself encodes the dietary-purity requirement — the specific technical idea that no mainstream navigation app currently implements.

**8.4 Travelling Salesman Problem (TSP) / route-planning heuristics — for the "Veg Food Trail" feature.**
Given a user-selected set of N vegetarian-verified restaurants (or "visit 5 pure-veg places in one evening"), finding the best visiting order is the classic TSP: NP-hard in general, but very tractable for small N (a handful of stops) using either exact dynamic programming (Held–Karp, feasible up to roughly a dozen nodes) or simple, effective heuristics like nearest-neighbor construction followed by 2-opt local-search improvement. This maps directly onto standard graph-theory/DAA syllabus coverage of NP-completeness and approximation, and gives the project a genuinely hard-problem talking point for the viva.

**8.5 Minimum Spanning Tree (MST) — infrastructure/analysis feature.**
While not a day-to-day user feature, computing the MST of the sub-graph induced by all verified vegetarian restaurants (using Prim's or Kruskal's algorithm) answers an interesting analytical question: "what is the minimum total road distance needed to keep every known vegetarian restaurant in Agartala connected to every other?" This is a clean, low-effort-to-implement bonus module that demonstrates a second classical algorithm family (Prim's/Kruskal's) beyond shortest-path.

**8.6 Graph clustering / community detection — "vegetarian food hub" identification.**
Applying a clustering or community-detection method (even something as simple as density-based spatial clustering, or a graph-modularity method) over the restaurant-node subgraph can identify de facto "vegetarian clusters" in the city (e.g., a market area with several Marwari-run pure-veg eateries) versus "food deserts." This is a genuinely useful discovery feature (the app can proactively suggest "this neighborhood has your best options") built on a graph-theory technique.

**8.7 Centrality measures — ranking and "trust."**
- **Degree centrality** on the restaurant-verification graph (how many independent users have confirmed a place's veg status) gives a simple, explainable trust score.
- **Closeness/betweenness centrality** on the road graph identifies which vegetarian restaurant is most "reachable" from the rest of the city on average — a natural candidate for a "most convenient overall" recommendation, distinct from "nearest to me right now."
- A PageRank-style reputation propagation over a **user-review trust graph** is a natural future extension (see Section 13) connecting this project to a second, very well-known graph algorithm.

**8.8 Bipartite graphs — matching diet type to restaurant attributes.**
User dietary requirements (strict Jain, lacto-vegetarian, egg-inclusive, satvik, allergy constraints) and restaurant attributes (menu tags, kitchen-purity level, cuisine type) can be modeled as a **bipartite graph** between "requirement types" and "restaurant attribute types," letting the recommendation logic be expressed as a bipartite matching/scoring problem instead of ad hoc if-else filtering — a cleaner, more extensible, and more "graph-theory-native" design than a simple boolean filter.

**8.9 Graph traversal for data collection/validation.**
Even the *process* of building the initial dataset — walking/crawling the OSM road graph to enumerate reachable POIs, or breadth-first-expanding outward from known "veg-dense" seed nodes to prioritize which unexplored areas to survey next — is itself a BFS/DFS application worth documenting as part of the system design.

---

## 9. Proposed System Architecture

Thinking as a software architect, VegRoute naturally decomposes into four layers:

```
 ┌───────────────────────────────────────────────────────────┐
 │  Presentation Layer                                        │
 │  Web/mobile UI: map view, search + purity-level filter,     │
 │  route view, "Veg Trail" multi-stop planner, contribute/    │
 │  verify-a-restaurant form                                   │
 └───────────────────────────────────────────────────────────┘
 ┌───────────────────────────────────────────────────────────┐
 │  Algorithm / Service Layer                                  │
 │  • Routing service (Dijkstra / A*)                          │
 │  • Trail-planning service (TSP heuristic: nearest-neighbor  │
 │    + 2-opt, or Held–Karp for small N)                       │
 │  • Discovery/ranking service (centrality + clustering)      │
 │  • Trust/verification service (degree centrality on the     │
 │    review graph; PageRank-style scoring as a stretch goal)  │
 └───────────────────────────────────────────────────────────┘
 ┌───────────────────────────────────────────────────────────┐
 │  Graph Construction Layer                                   │
 │  Converts raw map + restaurant data into an in-memory        │
 │  weighted directed graph (nodes = intersections + POIs,      │
 │  edges = road segments with distance/time weights, plus a    │
 │  separate small "restaurant attribute" graph/table for        │
 │  purity level, cuisine, and verification count)               │
 └───────────────────────────────────────────────────────────┘
 ┌───────────────────────────────────────────────────────────┐
 │  Data Layer                                                 │
 │  • Base road network: OpenStreetMap extract for Agartala     │
 │  • Restaurant dataset: manually surveyed + crowdsourced,     │
 │    cross-checked against Google/Zomato listings where they   │
 │    exist, tagged with a purity-confidence level               │
 │  • User-submitted verifications/reviews (feeds trust score)  │
 └───────────────────────────────────────────────────────────┘
```

Because Agartala's road graph is on the order of a few thousand nodes rather than a continent-scale network, the project does **not** need production-grade infrastructure like Contraction Hierarchies to be usable — a clean in-memory Dijkstra/A\* implementation is genuinely sufficient at this scale, which keeps the implementation timeline realistic for a semester. Contraction Hierarchies and Customizable Route Planning belong in the "Future Improvements" section as the answer to "how would this scale to all of Tripura or the whole Northeast."

---

## 10. Data Model — Representing Agartala as a Graph

- **Road graph:** extracted from an OpenStreetMap export of Agartala (tools such as OSMnx are the standard way researchers convert raw OSM data into a clean, analyzable street-network graph). Given documented recent community edits explicitly aimed at fixing "poorly mapped roads around Agartala," some manual cleanup/verification pass over the extracted graph should be budgeted for, rather than assuming the raw export is production-ready.
- **Restaurant nodes:** each vegetarian-relevant eatery is stored with coordinates (snapped to the nearest road node), a purity-level tag (e.g., Pure-Veg / Jain-Friendly / Satvik / Veg-Options-Available-Shared-Kitchen), cuisine tags, and a verification/trust count.
- **Edge weights:** base weight = distance; optional secondary weight = estimated travel time (useful once the project wants to demonstrate multi-criteria shortest path, e.g., "fastest" vs. "shortest" toggle, a small but genuinely instructive extension).
- **Verification/trust sub-graph:** a separate lightweight graph connecting users to the restaurants they have verified, which is what powers the degree-centrality-based trust score described in Section 8.7.

---

## 11. Real-World Feasibility

**Favorable factors:**
- Free, usable base map data exists for Agartala via OpenStreetMap, and community mapping activity in the area is active and ongoing.
- Agartala's road network is small enough to hold entirely in memory and run plain Dijkstra/A\* on with no meaningful latency — no need for continent-scale infrastructure.
- The restaurant dataset itself (the hard part) is small precisely *because* vegetarian supply is scarce in the city — which is inconvenient for "impressive scale" demos, but very convenient for a semester timeline, since a genuinely useful MVP could realistically be built from on-the-ground surveying of perhaps 40–150 real establishments rather than thousands.
- Cross-referencing against Google Business listings and Zomato/Swiggy (where an establishment happens to be onboarded there) provides a partial, free way to validate/seed the dataset instead of surveying completely from scratch.

**Real constraints to plan for:**
- Ground-truth data collection (which restaurants are genuinely vegetarian-safe, and at what purity level) is a manual, social process, not a technical one — likely the single biggest time cost in the project, and worth scoping down explicitly (e.g., "MVP covers 3–4 major localities" rather than "the whole city") to keep the semester timeline realistic.
- OSM road-network completeness/accuracy in Agartala, while actively improving, has had documented gaps that may need manual correction for the specific corridors the project chooses to demo.
- "Purity level" is a socially and religiously sensitive classification; the project should present it as **user-reported and confidence-scored**, not as an authoritative claim, both for data-quality honesty and to avoid overstating certainty about any specific establishment's practices.

**Overall assessment:** the *routing/algorithmic* half of the project is low-risk and well within a semester's scope; the *data-collection* half is the real feasibility bottleneck and should be scoped conservatively (a focused pilot area of the city) rather than attempting full city coverage.

---

## 12. Academic Relevance

VegRoute maps cleanly onto standard Graph Theory / Design-and-Analysis-of-Algorithms syllabus topics, which is exactly what makes it a strong choice for a semester project rather than just a "nice app idea":

- **Graph representation** (adjacency list/matrix trade-offs for a sparse road network) — a natural, concrete first section of any project report.
- **Graph traversal** (BFS/DFS) — used both conceptually (Section 8.9) and practically (connectivity checks, reachable-area computation).
- **Single-source shortest path** (Dijkstra, Bellman–Ford) and **heuristic search** (A\*) — the project's core feature, with a genuine, defensible reason to compare Dijkstra vs. A\* performance empirically on the Agartala graph as part of the report's evaluation section.
- **All-pairs shortest path** (Floyd–Warshall) — applicable at Agartala's city scale for precomputing restaurant-to-restaurant distances, feeding directly into the TSP module.
- **Minimum Spanning Tree** (Prim's/Kruskal's) — a clean second algorithm family, applied to the restaurant sub-graph (Section 8.5).
- **NP-completeness and approximation algorithms** (TSP) — the "Veg Trail" feature is a legitimate, real (not contrived) application of a topic every DAA/graph theory course covers, and gives the project a natural "here's an NP-hard problem and how we approximated it" viva talking point.
- **Graph clustering/centrality** — while sometimes taught in a more advanced networks/data-mining context, these are a natural "extended" section that shows initiative beyond the base syllabus.

Academically, the project's strongest asset is that **every major feature was chosen because it is a real instance of a syllabus algorithm**, rather than the more common (and weaker) student-project pattern of building an app first and retrofitting "which algorithm did we technically use" afterward.

---

## 13. Possible Future Improvements

- **Real-time traffic-aware weighting**, moving from static edge weights toward the kind of live, swappable weighting that Customizable Route Planning/Customizable Contraction Hierarchies are designed for in production systems.
- **Multi-modal routing** — walking, auto-rickshaw, and city-bus legs combined, rather than a single travel mode, which is how most trips in a city like Agartala actually happen.
- **PageRank-style trust propagation** over the user-verification graph, so a review from a long-standing, frequently-correct contributor carries more weight than a first-time or inconsistent one — a natural, well-known graph algorithm to layer on top of the existing degree-centrality trust score.
- **Scaling to Contraction Hierarchies** if the project (or a future version) expanded beyond a single city to all of Tripura or the wider Northeast, where a full Dijkstra/A\* over the raw graph would start to become genuinely slow.
- **Regional/language expansion** — Bengali and Kokborok language support, given Tripura's demographic makeup.
- **Offline-first design**, since connectivity in parts of Tripura and the broader Northeast is noted to be patchier than in metro India, making a lightweight offline mode a real usability improvement rather than a nice-to-have.
- **Integration with existing delivery platforms** (Zomato/Swiggy) as a secondary data source once an establishment is onboarded there, rather than only relying on manual survey data.
- **Extending the graded purity model** into a fuller bipartite matching system covering allergies and other dietary constraints (halal, Jain, gluten-free) beyond vegetarian/non-vegetarian alone.
- **Accessibility-aware routing** (shortest path subject to wheelchair-accessible edges only) as a further demonstration of constrained/weighted shortest-path variants.

---

## 14. Conclusion

VegRoute is a well-scoped, real-world-motivated semester project precisely because the gap it fills is specific and genuine: existing global vegetarian-discovery apps under-cover low-vegetarian-density Tier-3 cities like Agartala by design (their data model depends on community size), while existing navigation platforms solve routing excellently but have no concept of dietary purity as a routable attribute, and existing Indian food-delivery platforms solve purity-filtering but only within an onboarded delivery catalogue, not as a general-purpose local discovery-and-navigation tool. By representing Agartala's road network and its scattered vegetarian-friendly restaurants as a single weighted (and partly bipartite/attribute-augmented) graph, the project can legitimately apply — and clearly explain in a viva — shortest-path algorithms (Dijkstra/A\*), the Travelling Salesman Problem and its approximations, Minimum Spanning Tree construction, graph clustering, and centrality analysis, all in service of one coherent, locally useful application rather than as disconnected syllabus exercises.

---

## 15. References

1. HappyCow — official app listings and Wikipedia overview (feature set, listing counts, coverage model).
2. Business Standard, Outlook India, Inc42, NewsBytes, Al Jazeera — reporting on Zomato's "Pure Veg Mode" / "Veg Mode" launch, rationale, and public reception (2024).
3. Medium ("Dijkstra's Algorithm in GPS Navigation"), Meegle, Hackaday, and a university/industry write-up on "The fastest route: the mathematics of Google Maps" — explanations of Dijkstra's and A\*'s role in real navigation systems.
4. Wikipedia — "Contraction hierarchies"; Springer (Geisberger et al., "Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks"); arXiv papers on Customizable Contraction Hierarchies and time-dependent road-network routing; Mapsi.dev comparison of OSRM/Valhalla/GraphHopper — technical detail on production-grade routing speed-up techniques.
5. Wikipedia — Agartala railway station, Agartala flyover; MapsOfIndia road-network overview of Tripura; OpenStreetMap edit history for an Agartala road way — local infrastructure and base-map-data context.
6. drivingdirectionsandmaps.com — overview of Mappls/MapmyIndia, Google Maps, and OSM-based app coverage across India.
7. The Print, and a ResearchGate-hosted scientific diagram on state-wise vegetarianism — NFHS-5-derived vegetarian population figures for Indian states, including the Northeast/Tripura.
8. ResearchGate — "Graph-Based Approach for Personalized Travel Recommendations" (Bellman-Ford-based multi-factor travel routing); MDPI — personalized tour itinerary recommendation literature; arXiv survey — "A Survey on Point-of-Interest Recommendations Leveraging Heterogeneous Data"; arXiv papers on graph-based/graph-neural approaches to the Travelling Salesman Problem — academic grounding for the discovery, itinerary-planning, and TSP-based features proposed in this report.

*(Note: figures and claims above have been paraphrased and synthesized from the cited sources for this report; no text has been reproduced verbatim. Some 2026-dated secondary sources on state-wise meat/vegetarian statistics were cross-checked against the primary NFHS-5-derived reporting rather than relied on alone.)*
