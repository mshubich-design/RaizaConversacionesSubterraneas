(() => {
  "use strict";

  const DATA_URL = "raiza_base_datos_completa.json";
  const IMAGE_DIR = "./img/banco/";
  const IMAGE_OVERRIDES = {
    1: "suillus-granulatus.jpg",
    2: "suillus-sp.jpg",
    3: "inocybe-geophylla.jpg",
    4: "monotropa-uniflora.jpg",
    5: "tomitopsis-sp.jpg",
    6: "mycena-seynesii.jpg",
    7: "coprinellus-domesticus.jpg",
    8: "poliporo.jpg",
    9: "tulostoma-brumale.jpg",
    10: "simocybe-haustellaris.jpg",
    11: "fomitopsis-mouceae.jpg",
    12: "plantismatia-glauca.jpg"
  };

  const root = document.documentElement;
  const stage = document.getElementById("networkStage");
  const svg = d3.select("#networkSvg");
  const nodeLayer = d3.select("#networkNodes");
  const searchInput = document.getElementById("networkSearch");
  const clearSearch = document.getElementById("clearSearch");
  const searchStatus = document.getElementById("searchStatus");
  const detailPanel = document.getElementById("detailPanel");
  const loadingState = document.getElementById("loadingState");

  let database;
  let simulation;
  let graphNodes = [];
  let graphLinks = [];
  let nodeSelection;
  let linkSelection;
  let selectedId = null;

  const number = value => Number(value);
  const clean = value => String(value ?? "").trim();
  const byId = (items, id) => items.find(item => number(item.id) === number(id));

  async function start() {
    if (window.raizaLoader) raizaLoader.hold("red");
    try {
      const response = await fetch(DATA_URL);
      if (!response.ok) throw new Error(`No se pudo cargar el JSON (${response.status})`);
      database = await response.json();
      buildGraph();
      buildGallery();
      setupSearch();
      setupGallery();
      loadingState.classList.add("hidden");
      if (window.raizaLoader) raizaLoader.release("red");
      drawNetwork();
    } catch (error) {
      loadingState.textContent = "No se pudo cargar la base de datos. Abre la carpeta con Live Server.";
      console.error("Raiza:", error);
      if (window.raizaLoader) raizaLoader.release("red");
    }
  }

  function buildGraph() {
    graphNodes = database.hongos.map(fungus => {
      const habitat = byId(database.habitats, fungus.id);
      const processes = database.hongo_proceso
        .filter(row => number(row.hongo_id) === number(fungus.id))
        .map(row => byId(database.procesos, row.funcion_id))
        .filter(Boolean);
      const tag = byId(database.tags, fungus.id);
      const imageName = IMAGE_OVERRIDES[number(fungus.id)] || fungus.foto;
      return {
        id: number(fungus.id),
        name: clean(fungus.nombre),
        description: clean(fungus.descripcion || fungus.descripción),
        relation: clean(fungus.relacion),
        image: IMAGE_DIR + encodeURI(imageName),
        habitat: habitat ? `${clean(habitat.nombre)}. ${clean(habitat.descripcion)}` : "Sin información de hábitat",
        processes,
        tag: tag ? clean(tag.tag) : "",
        searchText: [
          fungus.nombre, fungus.descripcion, fungus.descripción, fungus.relacion,
          habitat?.nombre, habitat?.descripcion, tag?.tag,
          ...processes.flatMap(process => [process.funcion, process.proceso])
        ].join(" ").toLocaleLowerCase("es")
      };
    });

    // La tabla tagging relaciona el hongo_id con otro registro mediante tag_id.
    // Se agrupan las relaciones por pareja para evitar dibujar líneas duplicadas.
    const edgeMap = new Map();
    database.relaciones.forEach(row => {
      const sourceId = number(row.hongo_id);
      const targetId = number(row.tag_id);
      if (sourceId === targetId) return;
      if (!graphNodes.some(node => node.id === sourceId) || !graphNodes.some(node => node.id === targetId)) return;
      const key = [Math.min(sourceId, targetId), Math.max(sourceId, targetId)].join("-");
      if (!edgeMap.has(key)) edgeMap.set(key, { source: Math.min(sourceId, targetId), target: Math.max(sourceId, targetId), labels: new Set() });
      const label = clean(row.comparten_relacion);
      if (label) edgeMap.get(key).labels.add(label);
    });
    graphLinks = Array.from(edgeMap.values()).map(edge => ({
      source: edge.source,
      target: edge.target,
      labels: Array.from(edge.labels)
    }));
  }

  function drawNetwork() {
    const bounds = stage.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;

    // Distribución inicial amplia: aprovecha el lienzo sin amontonar los nodos en el centro.
    // Se reservan márgenes para que los hongos y sus etiquetas permanezcan dentro de la pantalla.
    graphNodes.forEach((node, index) => {
      const angle = (index / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
      const compactScreen = width < 700;
      const radiusX = Math.min(width * (compactScreen ? 0.34 : 0.405), compactScreen ? 250 : 620);
      const radiusY = Math.min(height * (compactScreen ? 0.32 : 0.405), compactScreen ? 220 : 390);
      const centerX = width * 0.5;
      const centerY = height * 0.55;
      node.anchorX = Math.max(54, Math.min(width - 54, centerX + Math.cos(angle) * radiusX));
      node.anchorY = Math.max(58, Math.min(height - 58, centerY + Math.sin(angle) * radiusY));
      node.x = node.anchorX;
      node.y = node.anchorY;
    });

    svg.selectAll("*").remove();
    const linkGroup = svg.append("g").attr("class", "links");
    linkSelection = linkGroup.selectAll("line")
      .data(graphLinks)
      .join("line")
      .attr("class", "network-link")
      .attr("data-source", d => typeof d.source === "object" ? d.source.id : d.source)
      .attr("data-target", d => typeof d.target === "object" ? d.target.id : d.target);

    nodeLayer.selectAll("*").remove();
    nodeSelection = nodeLayer.selectAll(".node-block")
      .data(graphNodes, d => d.id)
      .join("button")
      .attr("type", "button")
      .attr("class", "node-block")
      .attr("aria-label", d => `Ver información de ${d.name}`)
      .on("click", (event, d) => {
        if (event.defaultPrevented) return;
        selectNode(d.id);
      });

    nodeSelection.append("span").attr("class", "node-dot");
    nodeSelection.append("img")
      .attr("class", "node-image")
      .attr("src", d => d.image)
      .attr("alt", d => d.name)
      .attr("width", 70)
      .attr("height", 70)
      .attr("draggable", "false")
      .on("error", function() {
        this.style.visibility = "hidden";
        console.warn("No se encontró la imagen:", this.src);
      });
    nodeSelection.append("span").attr("class", "node-name").text(d => d.name);

    const drag = d3.drag()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(.22).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on("drag", (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      });
    nodeSelection.call(drag);

    const compactScreen = width < 700;
    simulation = d3.forceSimulation(graphNodes)
      .force("link", d3.forceLink(graphLinks).id(d => d.id).distance(compactScreen ? 132 : 178).strength(.34))
      .force("charge", d3.forceManyBody().strength(compactScreen ? -360 : -540))
      .force("center", d3.forceCenter(width / 2, height * 0.55))
      .force("collide", d3.forceCollide().radius(compactScreen ? 72 : 78).iterations(2))
      .force("x", d3.forceX(d => d.anchorX).strength(compactScreen ? .055 : .065))
      .force("y", d3.forceY(d => d.anchorY).strength(compactScreen ? .055 : .065))
      .on("tick", ticked);

    function ticked() {
      linkSelection
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      nodeSelection
        .style("left", d => `${d.x}px`)
        .style("top", d => `${d.y}px`);
    }
    applySearch(searchInput.value);
  }

  function selectNode(id) {
    selectedId = number(id);
    const fungus = graphNodes.find(node => node.id === selectedId);
    if (!fungus) return;
    document.getElementById("detailName").textContent = fungus.name;
    document.getElementById("detailDescription").textContent = fungus.description || "Sin descripción disponible.";
    document.getElementById("detailHabitat").textContent = fungus.habitat;
    document.getElementById("detailFunction").textContent = fungus.processes.length
      ? fungus.processes.map(item => `${item.funcion}: ${item.proceso}`).join(" ")
      : "Sin proceso asociado en la tabla Hongo-Proceso.";
    document.getElementById("detailRelation").textContent = fungus.relation || "Sin dato";
    const neighbors = graphLinks
      .filter(link => number(link.source.id ?? link.source) === selectedId || number(link.target.id ?? link.target) === selectedId)
      .map(link => {
        const otherId = number(link.source.id ?? link.source) === selectedId
          ? number(link.target.id ?? link.target) : number(link.source.id ?? link.source);
        const other = graphNodes.find(node => node.id === otherId);
        return other ? `${other.name}${link.labels?.length ? ` (${link.labels.join(", ")})` : ""}` : "";
      });
    document.getElementById("detailConnections").textContent = neighbors.length ? neighbors.join(" · ") : "No hay conexiones registradas.";
    detailPanel.classList.add("open");
    nodeSelection.classed("is-selected", d => d.id === selectedId);
    updateLinkEmphasis();
  }

  function updateLinkEmphasis() {
    if (!linkSelection) return;
    linkSelection.classed("is-active", d =>
      selectedId !== null &&
      (number(d.source.id ?? d.source) === selectedId || number(d.target.id ?? d.target) === selectedId)
    );
  }

  function setupSearch() {
    searchInput.addEventListener("input", () => applySearch(searchInput.value));
    clearSearch.addEventListener("click", () => {
      searchInput.value = "";
      applySearch("");
      searchInput.focus();
    });
  }

  function applySearch(value) {
    if (!nodeSelection) return;
    const query = clean(value).toLocaleLowerCase("es");
    clearSearch.style.display = query ? "block" : "none";
    const matches = graphNodes.filter(node => !query || node.searchText.includes(query));
    const ids = new Set(matches.map(node => node.id));
    nodeSelection
      .classed("is-dim", d => Boolean(query) && !ids.has(d.id))
      .classed("is-match", d => Boolean(query) && ids.has(d.id));
    linkSelection.classed("is-dim", link => {
      if (!query) return false;
      const sourceId = number(link.source.id ?? link.source);
      const targetId = number(link.target.id ?? link.target);
      return !ids.has(sourceId) && !ids.has(targetId);
    });
    searchStatus.textContent = query
      ? `${matches.length} ${matches.length === 1 ? "resultado" : "resultados"} en la red`
      : "Explora las conexiones subterráneas";
    if (matches.length === 1 && query) {
      selectedId = matches[0].id;
      nodeSelection.classed("is-selected", d => d.id === selectedId);
      updateLinkEmphasis();
    }
    if (!query) {
      selectedId = null;
      nodeSelection.classed("is-selected", false);
      linkSelection.classed("is-active", false);
    }
  }


  function buildGallery() {
    const gallery = document.getElementById("galleryGrid");
    graphNodes.forEach(fungus => {
      const item = document.createElement("article");
      item.className = "gallery-item";
      const image = document.createElement("img");
      image.src = fungus.image;
      image.alt = fungus.name;
      image.loading = "lazy";
      const title = document.createElement("span");
      title.textContent = fungus.name;
      item.append(image, title);
      gallery.append(item);
    });
  }

  function setupGallery() {
    const modal = document.getElementById("galleryModal");
    const open = () => { modal.classList.add("open"); modal.setAttribute("aria-hidden", "false"); };
    const close = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
    document.getElementById("galleryClose").addEventListener("click", close);
    document.getElementById("galleryBackdrop").addEventListener("click", close);
    document.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
  }

  document.getElementById("detailClose").addEventListener("click", () => detailPanel.classList.remove("open"));
  window.addEventListener("resize", () => {
    if (!simulation) return;
    const bounds = stage.getBoundingClientRect();
    const width = bounds.width;
    const height = bounds.height;
    const compactScreen = width < 700;
    graphNodes.forEach((node, index) => {
      const angle = (index / graphNodes.length) * Math.PI * 2 - Math.PI / 2;
      const radiusX = Math.min(width * (compactScreen ? 0.34 : 0.405), compactScreen ? 250 : 620);
      const radiusY = Math.min(height * (compactScreen ? 0.32 : 0.405), compactScreen ? 220 : 390);
      node.anchorX = Math.max(54, Math.min(width - 54, width * 0.5 + Math.cos(angle) * radiusX));
      node.anchorY = Math.max(58, Math.min(height - 58, height * 0.55 + Math.sin(angle) * radiusY));
    });
    simulation
      .force("center", d3.forceCenter(width / 2, height * 0.55))
      .force("x", d3.forceX(d => d.anchorX).strength(compactScreen ? .055 : .065))
      .force("y", d3.forceY(d => d.anchorY).strength(compactScreen ? .055 : .065))
      .force("link").distance(compactScreen ? 132 : 178);
    simulation.alpha(.45).restart();
  });

  start();
})();
