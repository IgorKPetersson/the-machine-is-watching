/*
 * Presentation controller. Each section in index.html is one scene. A scene's
 * data-step elements appear as its step number increases. The interactive
 * diagrams below keep their own state so a presenter can revisit a scene.
 */
(() => {
  "use strict";

  const scenes = [...document.querySelectorAll(".scene")];
  const steps = Array(scenes.length).fill(0);
  const maxSteps = [1, 4, 0, 3, 0, 0, 0, 0, 0, 6, 0, 7, 2];
  let current = 0;
  let startedAt = Date.now();
  document.getElementById("scene-total").textContent = String(scenes.length);
  document.getElementById("progress-track").setAttribute("aria-valuemax", String(scenes.length));

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const pad = (number) => String(number).padStart(2, "0");

  const diagramEdges = {
    machine: ["cameras", "phones", "text", "location", "relations", "ml"].map((part) => ["machine-" + part, "machine-core"]),
    builder: ["camera", "location", "communication", "identity", "text"].map((part) => ["build-" + part, "builder-core"]).concat([["builder-core", "build-llm"], ["build-llm", "build-agent"]]),
    people: ["phone", "car", "work", "place", "b", "c"].map((part) => ["person-johan", "person-" + part]).concat([["person-b", "person-b1"], ["person-b", "person-b2"], ["person-c", "person-c1"], ["person-c", "person-c2"]])
  };

  function centerWithin(element, container) {
    const a = element.getBoundingClientRect();
    const b = container.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  }

  function isNodeActive(node) {
    return node.classList.contains("is-on") || node.classList.contains("is-visible") || node.id === "machine-core" || node.id === "builder-core";
  }

  // SVG lines are measured against actual button positions, avoiding fixed
  // pixel coordinates when the viewport changes between projector and laptop.
  function drawDiagram(name) {
    const diagram = document.querySelector(`[data-diagram="${name}"]`);
    if (!diagram || !diagram.offsetWidth) return;
    const svg = diagram.querySelector(".wires");
    svg.setAttribute("viewBox", `0 0 ${diagram.clientWidth} ${diagram.clientHeight}`);
    svg.replaceChildren();
    diagramEdges[name].forEach(([fromId, toId]) => {
      const from = document.getElementById(fromId);
      const to = document.getElementById(toId);
      if (!from || !to) return;
      const active = isNodeActive(from) && isNodeActive(to);
      if (name === "people" && !active) return;
      const a = centerWithin(from, diagram);
      const b = centerWithin(to, diagram);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", a.x);
      line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x);
      line.setAttribute("y2", b.y);
      if (active) line.classList.add("is-active");
      if (diagram.dataset.pulseFrom === fromId) line.classList.add("is-data-pulse");
      svg.append(line);
    });
  }

  function drawVisibleDiagrams() {
    Object.keys(diagramEdges).forEach(drawDiagram);
    drawTrace();
  }

  function setStep(index, step) {
    steps[index] = Math.max(0, Math.min(maxSteps[index], step));
    scenes[index].querySelectorAll(".reveal[data-step]").forEach((item) => {
      item.classList.toggle("is-revealed", Number(item.dataset.step) <= steps[index]);
    });
    if (index === 11) {
      scenes[index].dataset.numberPhase = String(steps[index]);
      updateNumberEvidence();
    }
    if (index === 9) {
      updateAgentStage(steps[index]);
    }
  }

  function showScene(index) {
    if (index < 0 || index >= scenes.length || index === current && scenes[index].classList.contains("is-active")) return;
    const old = scenes[current];
    if (old.contains(document.activeElement)) document.activeElement.blur();
    old.classList.remove("is-active");
    old.hidden = true;
    current = index;
    const scene = scenes[current];
    scene.hidden = false;
    requestAnimationFrame(() => {
      scene.classList.add("is-active");
      drawVisibleDiagrams();
    });
    $("#scene-number").textContent = pad(current + 1);
    $("#scene-name").textContent = scene.dataset.title.toUpperCase();
    $("#progress-fill").style.width = `${((current + 1) / scenes.length) * 100}%`;
    $("#progress-track").setAttribute("aria-valuenow", String(current + 1));
    $("#previous-button").disabled = current === 0;
    $("#next-button").disabled = current === scenes.length - 1 && steps[current] >= maxSteps[current];
    updatePresenter();
  }

  function next() {
    if (current === 4 && advanceMetadata()) return;
    if (current === 6 && advanceQuiz()) return;
    if (current === 7 && revealPersonLink()) return;
    if (current === 11 && steps[current] === 6 && !selectedChoice) {
      $("#choice-result").textContent = "SELECT A RESPONSE TO CONTINUE";
      return;
    }
    if (steps[current] < maxSteps[current]) {
      setStep(current, steps[current] + 1);
      $("#next-button").disabled = current === scenes.length - 1 && steps[current] >= maxSteps[current];
      return;
    }
    showScene(current + 1);
  }

  $("#next-button").addEventListener("click", next);
  $("#previous-button").addEventListener("click", () => showScene(current - 1));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!$("#media-modal").hidden) closeMedia();
      else if (!$("#presenter-panel").hidden) togglePresenter(false);
      return;
    }
    // Space must still activate focused buttons. Arrow keys remain available
    // after clicking a button, since it normally retains keyboard focus.
    const target = event.target;
    if (target.closest("input, select, textarea, video, [contenteditable], [role='dialog']")) return;
    if (!$("#media-modal").hidden) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showScene(current + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      showScene(current - 1);
    } else if (event.code === "Space" || event.key === " ") {
      if (target.closest("button")) return;
      event.preventDefault();
      next();
    } else if (event.key.toLowerCase() === "p" && !event.repeat) {
      event.preventDefault();
      togglePresenter($("#presenter-panel").hidden);
    }
  });

  $("#fullscreen-button").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    } catch (_) {
      // The presentation still works when fullscreen is denied or unavailable.
    }
  });

  function updatePresenter() {
    $("#presenter-current").textContent = `${pad(current + 1)} / ${scenes[current].dataset.title.toUpperCase()}`;
    $("#presenter-next").textContent = current + 1 < scenes.length ? `NEXT: ${scenes[current + 1].dataset.title.toUpperCase()}` : "FINAL SCENE";
  }
  function togglePresenter(open) {
    $("#presenter-panel").hidden = !open;
    if (open) updatePresenter();
  }
  $("#presenter-close").addEventListener("click", () => togglePresenter(false));
  setInterval(() => {
    if ($("#presenter-panel").hidden) return;
    const seconds = Math.floor((Date.now() - startedAt) / 1000);
    $("#presenter-timer").textContent = `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
  }, 1000);

  // Optional video has no source until a person clicks Play. Missing files
  // lead to the designed placeholder without blocking the presentation.
  const video = $("#presentation-video");
  function loadMedia(path) {
    $("#media-filename").textContent = path;
    video.src = path;
    video.load();
    video.play().catch(() => {});
  }
  function closeMedia() {
    video.pause();
    video.removeAttribute("src");
    video.load();
    $("#media-modal").hidden = true;
    scenes[current].tabIndex = -1;
    scenes[current].focus({ preventScroll: true });
  }
  $$(".media-launch").forEach((button) => button.addEventListener("click", () => {
    $("#media-modal").hidden = false;
    $("#media-missing").classList.remove("is-hidden");
    video.classList.remove("is-ready");
    $("#media-modal-title").textContent = button.dataset.mediaTitle.toUpperCase();
    loadMedia(button.dataset.video);
    $("#media-close").focus();
  }));
  video.addEventListener("loadeddata", () => {
    video.classList.add("is-ready");
    $("#media-missing").classList.add("is-hidden");
  });
  video.addEventListener("error", () => {
    video.classList.remove("is-ready");
    $("#media-missing").classList.remove("is-hidden");
  });
  $("#media-close").addEventListener("click", closeMedia);
  $("#media-modal").addEventListener("click", (event) => {
    if (event.target.id === "media-modal") closeMedia();
  });

  $$("[data-optional-image]").forEach((image) => {
    const setLoaded = (loaded) => {
      image.classList.toggle("is-loaded", loaded);
      image.closest(".scene").classList.toggle("has-media-image", loaded);
    };
    image.addEventListener("load", () => setLoaded(true));
    image.addEventListener("error", () => setLoaded(false));
    if (image.complete && image.naturalWidth) setLoaded(true);
  });

  // Scene 3: activation is idempotent; reset returns all six sources to idle.
  const machineSources = $$("[data-machine-source]");
  const machineSignals = {
    "machine-cameras": ["FACE MATCH / 0.83", "CAMERA 07 / TRACKING ACTIVE", "CAMERA SOURCE CONNECTED"],
    "machine-phones": ["CONTACT SIGNAL / DEVICE 12", "2 RECENT COMMUNICATION LINKS", "COMMUNICATION SIGNAL LINKED"],
    "machine-text": ["ENTITY / LOCATION X", "KEYWORD MATCH / MEETING", "TEXT ENTITY EXTRACTED"],
    "machine-location": ["59.3293 N / 18.0686 E", "EVENT WINDOW / 14:31", "LOCATION SIGNAL LINKED"],
    "machine-relations": ["NETWORK / 04 CONNECTIONS", "SHARED CONTACT / PERSON B", "RELATIONSHIP GRAPH UPDATED"],
    "machine-ml": ["CLASSIFICATION / REVIEW", "CONFIDENCE / 0.71", "ANALYSIS STATE ACTIVE"]
  };
  let machineLogEntries = ["[14:32:00] CORE WAITING FOR INPUT"];
  function renderLog(selector, entries) {
    const list = $(selector);
    list.replaceChildren(...entries.slice(-3).map((entry) => {
      const item = document.createElement("li");
      item.textContent = entry;
      return item;
    }));
  }
  function updateMachine(latestSource = null) {
    const count = machineSources.filter((node) => node.classList.contains("is-on")).length;
    const states = ["DATA", "INFORMATION", "CONTEXT", "ANALYSIS", "DECISION SUPPORT", "DECISION SUPPORT", "SYSTEM READY"];
    $("#machine-status").textContent = states[count];
    $("#machine-core-detail").textContent = count ? `${pad(count)} / 06 INPUTS CONNECTED` : "WAITING FOR INPUT";
    $("#machine-core").classList.toggle("complexity-2", count >= 2);
    $("#machine-core").classList.toggle("complexity-3", count >= 5);
    if (latestSource) {
      const [headline, detail] = machineSignals[latestSource.id];
      $("#machine-signal strong").textContent = headline;
      $("#machine-signal small").textContent = detail;
    }
    renderLog("#machine-log", machineLogEntries);
    drawDiagram("machine");
  }
  machineSources.forEach((node) => node.addEventListener("click", () => {
    if (node.classList.contains("is-on")) return;
    node.classList.add("is-on");
    const count = machineSources.filter((source) => source.classList.contains("is-on")).length;
    machineLogEntries.push(`[14:32:${pad(count * 3 + 1)}] ${machineSignals[node.id][2]}`);
    updateMachine(node);
  }));
  $("#machine-reset").addEventListener("click", () => {
    machineSources.forEach((node) => node.classList.remove("is-on"));
    machineLogEntries = ["[14:32:00] CORE WAITING FOR INPUT"];
    $("#machine-signal strong").textContent = "NO SOURCE CONNECTED";
    $("#machine-signal small").textContent = "Activate any source to add visible data.";
    updateMachine();
  });

  // Scene 5: the content never appears, but each metadata edge adds context.
  const traceNodes = ["trace-a", "trace-b", "trace-c", "trace-x", "trace-d"];
  const traceEdges = [["trace-a", "trace-b"], ["trace-b", "trace-c"], ["trace-c", "trace-x"], ["trace-d", "trace-x"]];
  const traceCaptions = ["A contacted B. The message remains unknown.", "B contacted C. A chain begins to form.", "C visited Location X.", "D also visited Location X. A shared place links them."];
  let traceCount = 1;
  function drawTrace() {
    const graph = $("#metadata-graph");
    if (!graph.offsetWidth) return;
    const svg = graph.querySelector(".trace-wires");
    svg.setAttribute("viewBox", `0 0 ${graph.clientWidth} ${graph.clientHeight}`);
    svg.replaceChildren();
    traceEdges.slice(0, traceCount).forEach(([fromId, toId]) => {
      const a = centerWithin(document.getElementById(fromId), graph);
      const b = centerWithin(document.getElementById(toId), graph);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      [["x1", a.x], ["y1", a.y], ["x2", b.x], ["y2", b.y]].forEach(([key, value]) => line.setAttribute(key, value));
      svg.append(line);
    });
  }
  function updateTrace() {
    traceNodes.forEach((id, index) => document.getElementById(id).classList.toggle("is-visible", index < 2 || index === 2 && traceCount >= 2 || index === 3 && traceCount >= 3 || index === 4 && traceCount >= 4));
    $("#metadata-counter").textContent = `${pad(traceCount)} / 04`;
    $("#metadata-caption").textContent = traceCaptions[traceCount - 1];
    $("#metadata-next").disabled = traceCount === 4;
    drawTrace();
  }
  function advanceMetadata() {
    if (traceCount >= 4) return false;
    traceCount++;
    updateTrace();
    return true;
  }
  $("#metadata-next").addEventListener("click", advanceMetadata);

  // Scene 6: sources unlock the optional LLM and agent modules. All statuses
  // describe the diagram only; no real AI inference or data collection occurs.
  const buildSources = $$("[data-build-source]");
  const buildExtensions = $$("[data-build-extension]");
  let builderLogEntries = ["[09:41:00] CORE OFFLINE"];
  function pulseBuilderLine(node) {
    const diagram = $("[data-diagram='builder']");
    diagram.dataset.pulseFrom = node.id;
    drawDiagram("builder");
    setTimeout(() => {
      delete diagram.dataset.pulseFrom;
      drawDiagram("builder");
    }, 650);
  }
  function updateBuilder(triggeredNode = null) {
    const sourceCount = buildSources.filter((node) => node.classList.contains("is-on")).length;
    const extensionCount = buildExtensions.filter((node) => node.classList.contains("is-on")).length;
    const total = sourceCount + extensionCount;
    const llmActive = $("#build-llm").classList.contains("is-on");
    const agentActive = $("#build-agent").classList.contains("is-on");
    $("#build-llm").disabled = sourceCount < 5;
    $("#build-agent").disabled = !llmActive;
    $("#build-llm .module-requirement").textContent = sourceCount < 5 ? "REQUIRES CORE DATA MODEL" : llmActive ? "LANGUAGE LAYER ACTIVE" : "MODULE AVAILABLE";
    $("#build-agent .module-requirement").textContent = !llmActive ? "REQUIRES LLM LAYER" : agentActive ? "TOOL LOOP ACTIVE" : "MODULE AVAILABLE";
    let status = "SYSTEM OFFLINE";
    if (sourceCount >= 1) status = "INGESTING DATA";
    if (sourceCount >= 3) status = "LINKING ENTITIES";
    if (sourceCount === 5) status = "CORE DATA MODEL COMPLETE";
    if (llmActive) status = "LANGUAGE REASONING LAYER ACTIVE";
    if (agentActive) status = "SITUATIONAL MODEL GENERATED";
    $("#builder-status-text").textContent = status;
    $("#builder-source-count").textContent = `${pad(total)} / 07 MODULES ACTIVE`;
    $("#builder-core").classList.toggle("pulse", sourceCount >= 3);
    $("#scene-6").dataset.buildLevel = total === 7 ? "complete" : sourceCount ? "active" : "offline";
    [2, 3, 4, 5].forEach((threshold, index) => document.getElementById(`entity-${index + 1}`).classList.toggle("is-visible", sourceCount >= threshold));
    let notice = sourceCount ? status : "SELECT A DATA SOURCE";
    if (sourceCount === 5 && !llmActive) notice = "CORE DATA MODEL COMPLETE / LLM MODULE AVAILABLE";
    if (llmActive && !agentActive) notice = "LANGUAGE REASONING LAYER ACTIVE / AGENT MODULE AVAILABLE";
    if (agentActive) notice = "TOOL-ACTION LOOP ENABLED / SITUATIONAL MODEL GENERATED";
    $("#builder-notice").textContent = notice;
    renderLog("#builder-log", builderLogEntries);
    if (triggeredNode) pulseBuilderLine(triggeredNode);
    drawDiagram("builder");
  }
  buildSources.concat(buildExtensions).forEach((node) => node.addEventListener("click", () => {
    if (node.classList.contains("is-on")) return;
    node.classList.add("is-on");
    const activeCount = buildSources.concat(buildExtensions).filter((item) => item.classList.contains("is-on")).length;
    const message = node.dataset.result || (node.id === "build-llm" ? "LANGUAGE REASONING LAYER ACTIVE" : "TOOL-ACTION LOOP ENABLED");
    builderLogEntries.push(`[09:41:${pad(activeCount * 4)}] ${message}`);
    updateBuilder(node);
  }));
  $("#builder-reset").addEventListener("click", () => {
    buildSources.concat(buildExtensions).forEach((node) => node.classList.remove("is-on"));
    builderLogEntries = ["[09:41:00] CORE OFFLINE"];
    updateBuilder();
  });

  // Scene 7: one question and one answer are shown at a time.
  const quiz = [
    { question: "identify faces?", answer: "YES", note: "Accuracy depends on image quality, the system, and context." },
    { question: "analyze very large volumes of text?", answer: "YES", note: "Scale does not guarantee correct interpretation." },
    { question: "find relationships in large networks?", answer: "YES", note: "A detected link is not proof of intent." },
    { question: "use external tools?", answer: "PARTLY — WITH CONTROLS", note: "Access depends on granted tools, permissions, and supervision.", tone: "warning" },
    { question: "reliably know who will commit a crime?", answer: "NO", note: "A risk score is not knowledge of an individual's future actions.", tone: "no" }
  ];
  let quizIndex = 0;
  let quizRevealed = false;
  function updateQuiz() {
    const item = quiz[quizIndex];
    $("#quiz-counter").textContent = `QUESTION ${pad(quizIndex + 1)} / 05`;
    $("#quiz-question").textContent = item.question;
    $("#quiz-answer-text").textContent = item.answer;
    $("#quiz-note").textContent = item.note;
    $("#quiz-answer").classList.toggle("is-visible", quizRevealed);
    $("#quiz-answer").classList.toggle("is-warning", item.tone === "warning");
    $("#quiz-answer").classList.toggle("is-no", item.tone === "no");
    $("#quiz-action").innerHTML = quizRevealed ? quizIndex === quiz.length - 1 ? "CONTINUE <span>→</span>" : "NEXT QUESTION <span>→</span>" : "REVEAL ANSWER <span>→</span>";
  }
  function advanceQuiz() {
    if (!quizRevealed) { quizRevealed = true; updateQuiz(); return true; }
    if (quizIndex < quiz.length - 1) { quizIndex++; quizRevealed = false; updateQuiz(); return true; }
    return false;
  }
  $("#quiz-action").addEventListener("click", () => {
    if (!advanceQuiz()) showScene(7);
  });
  $("#quiz-reset").addEventListener("click", () => { quizIndex = 0; quizRevealed = false; updateQuiz(); });

  // Scene 8: every visible first-degree node can be selected directly. The
  // guided button remains available for a presenter who prefers a fixed order.
  const personLinks = $$("[data-person-link]");
  const activePersonLinks = new Set();
  function updatePeople() {
    personLinks.forEach((node) => node.classList.toggle("is-on", activePersonLinks.has(node.id)));
    const count = activePersonLinks.size;
    $("#network-result").textContent = count >= 3 ? "A NETWORK" : count ? "A PROFILE" : "ONE PERSON";
    $("#connection-count").textContent = `${pad(count)} / 06`;
    $("#person-next").disabled = count === personLinks.length;
    drawDiagram("people");
  }
  function revealPersonLink() {
    const nextLink = personLinks.find((node) => !activePersonLinks.has(node.id));
    if (!nextLink) return false;
    activatePersonLink(nextLink);
    return true;
  }
  function activatePersonLink(node) {
    if (!activePersonLinks.has(node.id)) {
      activePersonLinks.add(node.id);
      $("#network-fact").textContent = `${node.textContent.replace("+", "").trim()} / ${node.dataset.linkLabel}`;
      updatePeople();
      return;
    }
    if (node.id === "person-b" || node.id === "person-c") {
      const related = node.id === "person-b" ? ["person-b1", "person-b2"] : ["person-c1", "person-c2"];
      related.forEach((childId) => document.getElementById(childId).classList.toggle("is-visible"));
      drawDiagram("people");
    }
  }
  $("#person-next").addEventListener("click", revealPersonLink);
  personLinks.forEach((node) => node.addEventListener("click", () => activatePersonLink(node)));
  $("#person-reset").addEventListener("click", () => {
    activePersonLinks.clear();
    $$("#scene-8 .secondary-node").forEach((node) => node.classList.remove("is-visible"));
    $("#network-fact").textContent = "Select a nearby node to resolve a relationship.";
    updatePeople();
  });
  $(".tooltip-trigger").addEventListener("click", (event) => {
    const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
    event.currentTarget.setAttribute("aria-expanded", String(!expanded));
  });

  // Scene 9: selecting an ontology object highlights its relationships and
  // opens a compact fictional object card.
  const ontologyObjects = {
    person: ["PERSON / P-104", "Linked to VEHICLE V-22, PLACE L-05, and EVENT E-17."],
    place: ["PLACE / L-05", "Frequent location for P-104. Related event: E-17."],
    vehicle: ["VEHICLE / V-22", "Owner: P-104. Last place: L-05. Related event: E-17."],
    event: ["EVENT / E-17", "Time: 14:31. Place: L-05. People: P-104 and P-208."],
    intelligence: ["INTELLIGENCE / I-09", "Illustrative analyst note linked to E-17. Confidence: 0.71."]
  };
  $$("[data-ontology]").forEach((node) => node.addEventListener("click", () => {
    const key = node.dataset.ontology;
    $$("[data-ontology]").forEach((other) => other.classList.toggle("is-on", other === node));
    $$("[data-ontology-edge]").forEach((edge) => edge.classList.toggle("is-active", edge.dataset.ontologyEdge.split(" ").includes(key)));
    const [title, detail] = ontologyObjects[key];
    $("#ontology-card strong").textContent = title;
    $("#ontology-card p").textContent = detail;
  }));

  // Scene 10: the first step switches modes. Later steps expose the agent's
  // goal, plan, tool, result, next decision, and loop one click at a time.
  function updateAgentStage(step) {
    const active = step > 0;
    const stage = $("#agent-stage");
    stage.classList.toggle("is-agent", active);
    stage.dataset.agentStep = String(step);
    $("#agent-mode-index").textContent = active ? "MODE 02" : "MODE 01";
    $("#agent-mode-label").textContent = active ? "AGENT" : "LLM";
    $$("#extended-flow [data-agent-step]").forEach((item) => item.classList.toggle("is-visible", Number(item.dataset.agentStep) <= step));
    const labels = ["ACTIVATE AGENT VIEW", "SHOW PLAN", "SHOW TOOL", "SHOW RESULT", "SHOW NEXT DECISION", "COMPLETE LOOP", "RESTART EXAMPLE"];
    $("#agent-toggle").innerHTML = `${labels[step]} <span>${step === 6 ? "↺" : "→"}</span>`;
  }
  $("#agent-toggle").addEventListener("click", () => {
    setStep(9, steps[9] === 6 ? 0 : steps[9] + 1);
  });
  $("#agent-reset").addEventListener("click", () => setStep(9, 0));

  // Scene 11: actor selection changes both the explanation and the visible
  // layer of the system. Other layers remain present but subdued.
  const governance = {
    state: ["THE STATE / LAW, MISSION, AUTHORITY", "Public institutions define legal authority and the system's mission."],
    company: ["THE AI COMPANY / MODEL, SAFETY POLICY, USAGE RESTRICTIONS", "The provider designs the model and places restrictions on how customers may use it."],
    operator: ["THE OPERATOR / TOOLS, PERMISSIONS, ACTION", "The operator works within granted permissions and remains responsible for each action."]
  };
  $$("[data-governance]").forEach((node) => node.addEventListener("click", () => {
    $$("[data-governance]").forEach((other) => other.classList.toggle("is-on", other === node));
    $("#governance-layers").dataset.activeLayer = node.dataset.governance;
    $$("[data-layer]").forEach((layer) => layer.classList.toggle("is-on", layer.dataset.layer === node.dataset.governance));
    const [label, description] = governance[node.dataset.governance];
    $("#governance-description span").textContent = label;
    $("#governance-description p").textContent = description;
  }));

  // Scene 12: a choice records only the current browser session. The sample
  // score is deliberately labelled fictional and does not evaluate a person.
  let selectedChoice = null;
  const numberEvidenceLogs = [
    "[16:08:00] AWAITING EVIDENCE",
    "[16:08:03] LOCATION X LINKED",
    "[16:08:06] SUBJECT B LINKED",
    "[16:08:09] INCIDENT C LINKED",
    "[16:08:12] COMMUNICATION SIGNAL LINKED"
  ];
  function drawEvidenceLinks() {
    const container = $("#scene-12 .number-layout");
    const svg = $("#evidence-links");
    if (!container.offsetWidth || steps[11] < 1) {
      svg.replaceChildren();
      return;
    }
    svg.setAttribute("viewBox", `0 0 ${container.clientWidth} ${container.clientHeight}`);
    svg.replaceChildren();
    const containerBox = container.getBoundingClientRect();
    const subjectBox = $("#number-subject").getBoundingClientRect();
    const target = {
      x: subjectBox.left - containerBox.left,
      y: subjectBox.top - containerBox.top + subjectBox.height / 2
    };
    $$("#number-evidence .evidence-item").slice(0, Math.min(steps[11], 4)).forEach((item) => {
      const itemBox = item.getBoundingClientRect();
      const from = {
        x: itemBox.right - containerBox.left,
        y: itemBox.top - containerBox.top + itemBox.height / 2
      };
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      [["x1", from.x], ["y1", from.y], ["x2", target.x], ["y2", target.y]].forEach(([key, value]) => line.setAttribute(key, value));
      svg.append(line);
    });
  }
  function updateNumberEvidence() {
    const evidenceCount = Math.min(steps[11], 4);
    $("#evidence-counter").textContent = `${pad(evidenceCount)} / 04`;
    $("#number-log").textContent = numberEvidenceLogs[evidenceCount];
    $("#scene-12").classList.toggle("risk-visible", steps[11] >= 5);
    requestAnimationFrame(drawEvidenceLinks);
  }
  $$("[data-choice]").forEach((button) => button.addEventListener("click", () => {
    selectedChoice = button.dataset.choice;
    $$("[data-choice]").forEach((option) => option.classList.toggle("is-selected", option === button));
    $("#choice-result").textContent = `CLASS CHOICE: ${selectedChoice} — ${button.textContent.trim().replace(/^\w\s+/, "")}`;
    $("#number-log").textContent = `[16:08:18] CLASS RESPONSE ${selectedChoice} RECORDED`;
  }));

  window.addEventListener("resize", () => { drawVisibleDiagrams(); drawEvidenceLinks(); });
  document.addEventListener("fullscreenchange", () => { drawVisibleDiagrams(); drawEvidenceLinks(); });
  scenes.forEach((_, index) => setStep(index, 0));
  updateMachine();
  updateTrace();
  updateBuilder();
  updateQuiz();
  updatePeople();
  $("#previous-button").disabled = true;
  startedAt = Date.now();
  requestAnimationFrame(drawVisibleDiagrams);
})();
