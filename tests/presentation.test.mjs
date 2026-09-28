// Dependency-free browser integration check. Run: node tests/presentation.test.mjs
// Chrome must be installed. This exercises the real local HTML file offline.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
assert.ok(existsSync(chromePath), `Chrome not found: ${chromePath}`);
const profile = mkdtempSync(join(root, ".chrome-test-"));
const screenshotDir = join(root, ".qa-output");
const captureScreenshots = process.argv.includes("--screenshots");
const chrome = spawn(chromePath, [
  "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--window-size=1920,1080",
  pathToFileURL(join(root, "index.html")).href
], { stdio: "ignore" });

const delay = (ms) => new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
const pad = (number) => String(number).padStart(2, "0");
let socket;
let nextId = 1;
const pending = new Map();
const externalRequests = [];
let frameStats;

async function waitForPort() {
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 120; i++) {
    if (existsSync(portFile)) return Number(readFileSync(portFile, "utf8").split("\n")[0]);
    if (chrome.exitCode !== null) throw new Error(`Chrome exited: ${chrome.exitCode}`);
    await delay(100);
  }
  throw new Error("Chrome debugging endpoint did not start");
}

function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolvePromise, reject) => {
    pending.set(id, { resolvePromise, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(response.exceptionDetails.text);
  return response.result.value;
}

async function click(selector) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
}

async function key(key, code, virtualKey) {
  const values = { key, code, windowsVirtualKeyCode: virtualKey, nativeVirtualKeyCode: virtualKey };
  await send("Input.dispatchKeyEvent", { type: "rawKeyDown", ...values });
  await send("Input.dispatchKeyEvent", { type: "keyUp", ...values });
}

const right = () => key("ArrowRight", "ArrowRight", 39);
const left = () => key("ArrowLeft", "ArrowLeft", 37);
const space = () => key(" ", "Space", 32);
const scene = () => evaluate("Number(document.querySelector('#scene-number').textContent)");
const text = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}).textContent.trim()`);
const hasAsset = (path) => existsSync(join(root, path));

async function waitFor(expression, message) {
  for (let i = 0; i < 60; i++) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  throw new Error(message);
}

async function checkClip(selector, available) {
  assert.equal(await evaluate("document.querySelector('#presentation-video').hasAttribute('src')"), false);
  await click(selector);
  assert.equal(await evaluate("document.querySelector('#media-modal').hidden"), false);
  if (available) {
    await waitFor("document.querySelector('#presentation-video').classList.contains('is-ready')", `Clip did not load: ${selector}`);
    assert.equal(await evaluate("document.querySelector('#presentation-video').paused"), false);
    // Native controls remain available for pause and volume adjustment.
    assert.deepEqual(await evaluate("(() => { const v = document.querySelector('#presentation-video'); v.pause(); v.volume = 0.35; return { paused: v.paused, volume: v.volume, controls: v.controls }; })()"), { paused: true, volume: 0.35, controls: true });
  } else {
    await waitFor("document.querySelector('#presentation-video').error !== null", `Missing clip did not fail gracefully: ${selector}`);
    assert.equal(await evaluate("document.querySelector('#media-missing').classList.contains('is-hidden')"), false);
  }
  await click("#media-close");
  assert.equal(await evaluate("document.querySelector('#media-modal').hidden"), true);
  assert.equal(await evaluate("document.querySelector('#presentation-video').hasAttribute('src')"), false);
}

async function screenshot(name) {
  if (!captureScreenshots) return;
  if (name.startsWith("scene-01-")) await delay(1900); // Opening title types in.
  await delay(420); // Wait for the short scene fade before visual review.
  mkdirSync(screenshotDir, { recursive: true });
  const result = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(screenshotDir, name), Buffer.from(result.data, "base64"));
}

async function checkLayout(width, height) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  await delay(100);
  const result = await evaluate(`(() => {
    const active = document.querySelector('.scene.is-active');
    const content = active.querySelector('.scene-content');
    return {
      scene: active.id,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      verticalOverflow: content.scrollHeight > content.clientHeight + 4,
      contentScroll: content.scrollHeight,
      contentClient: content.clientHeight,
      width: innerWidth,
      height: innerHeight
    };
  })()`);
  assert.equal(result.horizontalOverflow, false, `Horizontal overflow: ${width}x${height} ${result.scene}`);
  assert.equal(result.verticalOverflow, false, `Content overflow: ${JSON.stringify(result)}`);
}

try {
  const port = await waitForPort();
  let target;
  for (let i = 0; i < 50; i++) {
    const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    target = pages.find((page) => page.type === "page" && page.url.endsWith("/index.html"));
    if (target) break;
    await delay(100);
  }
  assert.ok(target, "Presentation page did not open");
  socket = new WebSocket(target.webSocketDebuggerUrl);
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.requestWillBeSent") {
      const url = message.params.request.url;
      if (/^https?:/i.test(url)) externalRequests.push(url);
    }
    if (!message.id || !pending.has(message.id)) return;
    const task = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) task.reject(new Error(message.error.message));
    else task.resolvePromise(message.result);
  });
  await new Promise((resolvePromise, reject) => {
    socket.addEventListener("open", resolvePromise, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  for (let i = 0; i < 50 && await evaluate("document.readyState") !== "complete"; i++) await delay(50);
  assert.equal(await evaluate("document.readyState"), "complete");
  assert.equal(await evaluate("document.querySelectorAll('.scene').length"), 13);
  assert.equal(await evaluate("document.querySelector('#presentation-video').hasAttribute('src')"), false);
  assert.equal(await scene(), 1);
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.typed-line')).clipPath"), "none");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
  await checkLayout(1920, 1080);
  assert.equal(await evaluate("document.querySelector('#scene-1 .opening-optional-image').classList.contains('is-loaded')"), hasAsset("assets/images/poi-surveillance.jpg"));
  await screenshot("scene-01-1920.png");
  await evaluate("document.querySelector('#scene-1 .opening-optional-image').src = 'assets/images/not-installed.jpg'");
  await waitFor("!document.querySelector('#scene-1').classList.contains('has-media-image')", "Opening image fallback did not activate");
  await evaluate("document.querySelector('#scene-1 .opening-optional-image').src = 'assets/images/poi-surveillance.jpg'");
  if (hasAsset("assets/images/poi-surveillance.jpg")) await waitFor("document.querySelector('#scene-1').classList.contains('has-media-image')", "Opening image did not restore");
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await send("Emulation.setCPUThrottlingRate", { rate: 4 });
  frameStats = await evaluate(`(async () => {
    const intervals = [];
    let previous = await new Promise(requestAnimationFrame);
    for (let i = 0; i < 90; i++) {
      const now = await new Promise(requestAnimationFrame);
      intervals.push(now - previous);
      previous = now;
    }
    intervals.sort((a, b) => a - b);
    return { median: intervals[45], p95: intervals[85] };
  })()`);
  await send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  assert.ok(frameStats.p95 <= 50, `Animation frame p95 exceeded 50 ms under 4x CPU throttle: ${JSON.stringify(frameStats)}`);
  await space();
  assert.equal(await evaluate("document.querySelector('#scene-1 .hero-sub').classList.contains('is-revealed')"), true);

  await checkClip("#scene-1 .media-launch", hasAsset("assets/video/poi-intro.mp4"));
  // A deliberately absent file must still show the original placeholder.
  await evaluate("document.querySelector('#scene-1 .media-launch').dataset.video = 'assets/video/not-installed.mp4'");
  await checkClip("#scene-1 .media-launch", false);
  await evaluate("document.querySelector('#scene-1 .media-launch').dataset.video = 'assets/video/poi-intro.mp4'");

  await right();
  assert.equal(await scene(), 2);
  await click("#previous-button");
  assert.equal(await scene(), 1);
  await click("#next-button");
  assert.equal(await scene(), 2);
  for (let i = 0; i < 4; i++) await space();
  assert.equal(await evaluate("document.querySelectorAll('#scene-2 .reveal.is-revealed').length"), 4);
  assert.equal(await evaluate("document.querySelector('#scene-2 .image-frame img').classList.contains('is-loaded')"), hasAsset("assets/images/poi-machine.jpg"));
  await checkLayout(1920, 1080);
  await screenshot("scene-02-1920.png");
  await evaluate("document.querySelector('#scene-2 .image-frame img').src = 'assets/images/not-installed.jpg'");
  await waitFor("!document.querySelector('#scene-2 .image-frame img').classList.contains('is-loaded')", "2011 image fallback did not activate");
  assert.equal(await evaluate("document.querySelector('#scene-2 .image-fallback').getClientRects().length > 0"), true);
  await evaluate("document.querySelector('#scene-2 .image-frame img').src = 'assets/images/poi-machine.jpg'");
  if (hasAsset("assets/images/poi-machine.jpg")) await waitFor("document.querySelector('#scene-2 .image-frame img').classList.contains('is-loaded')", "2011 image did not restore");
  await right();
  assert.equal(await scene(), 3);
  const machineIds = ["machine-cameras", "machine-phones", "machine-text", "machine-location", "machine-relations", "machine-ml"];
  const machineStates = ["INFORMATION", "CONTEXT", "ANALYSIS", "DECISION SUPPORT", "DECISION SUPPORT", "SYSTEM READY"];
  for (let i = 0; i < machineIds.length; i++) {
    await click(`#${machineIds[i]}`);
    assert.equal(await text("#machine-status"), machineStates[i]);
  }
  assert.equal(await text("#machine-status"), "SYSTEM READY");
  assert.ok((await text("#machine-signal")).includes("CLASSIFICATION / REVIEW"));
  assert.equal(await evaluate("document.querySelectorAll('#machine-log li').length"), 3);
  assert.equal(await evaluate("document.querySelectorAll('#scene-3 .wires .is-active').length"), 6);
  await screenshot("scene-03-1920.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await checkLayout(1366, 768);
  await screenshot("scene-03-active-1366.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await click("#machine-reset");
  assert.equal(await text("#machine-status"), "DATA");
  assert.ok((await text("#machine-signal")).includes("NO SOURCE CONNECTED"));
  assert.equal(await evaluate("document.querySelectorAll('#machine-log li').length"), 1);
  await right();
  for (let i = 0; i < 3; i++) await space();
  assert.equal(await scene(), 4);
  assert.equal(await evaluate("document.querySelector('#scene-4 .snowden-reveal').classList.contains('is-revealed')"), true);
  await checkClip("#scene-4 .media-launch", hasAsset("assets/video/poi-system-surveillance.mp4"));
  await screenshot("scene-04-1920.png");
  await right();
  for (let i = 0; i < 3; i++) await click("#metadata-next");
  assert.equal(await text("#metadata-counter"), "04 / 04");
  assert.equal(await evaluate("document.querySelectorAll('#metadata-graph line').length"), 4);
  await right();
  assert.equal(await scene(), 6);
  assert.equal(await evaluate("document.querySelector('#build-llm').disabled"), true);
  assert.equal(await evaluate("document.querySelector('#build-agent').disabled"), true);
  assert.ok((await text("#build-llm")).includes("REQUIRES CORE DATA MODEL"));
  for (const id of ["build-camera", "build-location", "build-communication", "build-identity", "build-text"]) await click(`#${id}`);
  assert.equal(await text("#builder-status-text"), "CORE DATA MODEL COMPLETE");
  assert.ok((await text("#builder-notice")).includes("LLM MODULE AVAILABLE"));
  assert.equal(await evaluate("document.querySelector('#build-llm').disabled"), false);
  assert.equal(await evaluate("document.querySelector('#build-agent').disabled"), true);
  await click("#build-llm");
  assert.equal(await text("#builder-status-text"), "LANGUAGE REASONING LAYER ACTIVE");
  assert.ok((await text("#builder-notice")).includes("AGENT MODULE AVAILABLE"));
  assert.equal(await evaluate("document.querySelector('#build-agent').disabled"), false);
  await click("#build-agent");
  assert.equal(await text("#builder-status-text"), "SITUATIONAL MODEL GENERATED");
  assert.ok((await text("#builder-notice")).includes("TOOL-ACTION LOOP ENABLED"));
  assert.equal(await evaluate("document.querySelectorAll('#builder-log li').length"), 3);
  assert.equal(await evaluate("document.querySelector('#scene-6').dataset.buildLevel"), "complete");
  await screenshot("scene-06-1920.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await checkLayout(1366, 768);
  await screenshot("scene-06-active-1366.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await click("#builder-reset");
  assert.equal(await text("#builder-status-text"), "SYSTEM OFFLINE");
  assert.equal(await evaluate("document.querySelector('#scene-6').dataset.buildLevel"), "offline");
  assert.equal(await evaluate("document.querySelector('#build-llm').disabled"), true);
  assert.equal(await evaluate("document.querySelectorAll('#builder-log li').length"), 1);
  await right();
  assert.equal(await scene(), 7);
  assert.equal(await evaluate("document.querySelector('#quiz-answer').classList.contains('is-visible')"), false);
  for (let i = 0; i < 5; i++) {
    await click("#quiz-action");
    assert.equal(await evaluate("document.querySelector('#quiz-answer').classList.contains('is-visible')"), true);
    if (i < 4) await click("#quiz-action");
  }
  assert.equal(await text("#quiz-answer-text"), "NO");
  await click("#quiz-reset");
  assert.equal(await text("#quiz-counter"), "QUESTION 01 / 05");
  assert.equal(await evaluate("document.querySelector('#quiz-answer').classList.contains('is-visible')"), false);
  await right();
  assert.equal(await scene(), 8);
  assert.equal(await evaluate("document.querySelectorAll('#scene-8 [data-person-link]').length"), 6);
  await click("#person-phone");
  assert.equal(await text("#network-result"), "A PROFILE");
  assert.ok((await text("#network-fact")).includes("DEVICE LINK"));
  await click("#person-car");
  await click("#person-work");
  assert.equal(await text("#network-result"), "A NETWORK");
  for (let i = 0; i < 3; i++) await click("#person-next");
  assert.equal(await text("#connection-count"), "06 / 06");
  await click("#person-b");
  assert.equal(await evaluate("document.querySelector('#person-b1').classList.contains('is-visible')"), true);
  await click("#person-c");
  assert.equal(await evaluate("document.querySelector('#person-c1').classList.contains('is-visible')"), true);
  await screenshot("scene-08-active-1920.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await checkLayout(1366, 768);
  await screenshot("scene-08-active-1366.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await click(".tooltip-trigger");
  assert.equal(await evaluate("document.querySelector('.tooltip-trigger').getAttribute('aria-expanded')"), "true");
  await click("#person-reset");
  assert.equal(await text("#connection-count"), "00 / 06");
  assert.equal(await evaluate("document.querySelectorAll('#scene-8 .wires .is-active').length"), 0);
  assert.equal(await evaluate("document.querySelector('#person-b1').classList.contains('is-visible')"), false);
  await right();
  assert.equal(await scene(), 9);
  assert.equal(await evaluate("document.querySelector('#scene-9 .ontology-support-image').classList.contains('is-loaded')"), hasAsset("assets/images/poi-server-room.jpg"));
  await click("[data-ontology='person']");
  assert.ok((await text("#ontology-card")).includes("PERSON / P-104"));
  assert.equal(await evaluate("document.querySelectorAll('#scene-9 [data-ontology-edge].is-active').length"), 4);
  await click("[data-ontology='event']");
  assert.ok((await text("#ontology-card")).includes("EVENT / E-17"));
  await screenshot("scene-09-1920.png");
  await right();
  assert.equal(await scene(), 10);
  assert.ok((await text("#llm-flow")).includes("Who was at Location X?"));
  for (let step = 1; step <= 6; step++) {
    await click("#agent-toggle");
    assert.equal(await evaluate("Number(document.querySelector('#agent-stage').dataset.agentStep)"), step);
    assert.equal(await evaluate("document.querySelectorAll('#extended-flow .is-visible').length"), step);
  }
  assert.equal(await text("#agent-mode-label"), "AGENT");
  assert.ok((await text("#extended-flow")).includes("5 linked entities found"));
  await screenshot("scene-10-agent-1920.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await checkLayout(1366, 768);
  await screenshot("scene-10-agent-1366.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await click("#agent-reset");
  assert.equal(await text("#agent-mode-label"), "LLM");
  await right();
  assert.equal(await scene(), 11);
  await click("[data-governance='state']");
  assert.ok((await text("#governance-description")).includes("legal authority"));
  assert.equal(await evaluate("document.querySelectorAll('#governance-layers [data-layer=\"state\"].is-on').length"), 3);
  await click("[data-governance='company']");
  assert.ok((await text("#governance-description")).includes("provider designs the model"));
  assert.equal(await evaluate("document.querySelectorAll('#governance-layers [data-layer=\"company\"].is-on').length"), 3);
  await click("[data-governance='operator']");
  assert.ok((await text("#governance-description")).includes("granted permissions"));
  assert.equal(await evaluate("document.querySelectorAll('#governance-layers [data-layer=\"operator\"].is-on').length"), 3);
  await screenshot("scene-11-1920.png");
  await right();
  assert.equal(await scene(), 12);
  for (let i = 0; i < 4; i++) await space();
  assert.equal(await text("#evidence-counter"), "04 / 04");
  await waitFor("document.querySelectorAll('#evidence-links line').length === 4", "Evidence links did not render");
  assert.equal(await evaluate("document.querySelectorAll('#evidence-links line').length"), 4);
  await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').classList.contains('risk-visible')"), true);
  await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').dataset.numberPhase"), "6");
  await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').dataset.numberPhase"), "6");
  await click("[data-choice='B']");
  assert.ok((await text("#choice-result")).includes("HUMAN REVIEW"));
  assert.ok((await text("#number-log")).includes("CLASS RESPONSE B RECORDED"));
  assert.equal(await evaluate("document.querySelector('#scene-12 .number-optional-image').classList.contains('is-loaded')"), hasAsset("assets/images/poi-number.jpg"));
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await checkLayout(1366, 768);
  await screenshot("scene-12-case-1366.png");
  await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await checkClip("#scene-12 .media-launch", hasAsset("assets/video/poi-number.mp4"));
  await evaluate("document.querySelector('#scene-12 .media-launch').dataset.video = 'assets/video/not-installed.mp4'");
  await checkClip("#scene-12 .media-launch", false);
  await evaluate("document.querySelector('#scene-12 .media-launch').dataset.video = 'assets/video/poi-number.mp4'");
  await screenshot("scene-12-1920.png");
  for (let i = 0; i < 3; i++) await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').dataset.numberPhase"), "9");
  await right();
  assert.equal(await scene(), 13);
  for (let i = 0; i < 3; i++) await space();
  await screenshot("scene-13-1920.png");
  await checkLayout(1920, 1080);

  // Walk all scenes at the requested laptop viewport, checking clipping and
  // horizontal scrolling in the real browser layout.
  await send("Emulation.setDeviceMetricsOverride", { width: 1366, height: 768, deviceScaleFactor: 1, mobile: false });
  await screenshot("scene-13-1366.png");
  for (let i = 13; i >= 1; i--) {
    assert.equal(await scene(), i);
    await checkLayout(1366, 768);
    if (i === 2) assert.equal(await evaluate("document.querySelector('#scene-2 .image-frame img').classList.contains('is-loaded')"), hasAsset("assets/images/poi-machine.jpg"));
    await screenshot(`scene-${pad(i)}-1366.png`);
    if (i > 1) await left();
  }
  assert.deepEqual(externalRequests, []);
  console.log("PASS: 13 scenes, navigation, reveals, networks, quiz, resets, optional media, 1920x1080 and 1366x768 layout.");
  console.log(`Animation proxy (4x CPU throttle, 1366x768): median ${frameStats.median.toFixed(1)} ms, p95 ${frameStats.p95.toFixed(1)} ms.`);
  if (captureScreenshots) console.log(`Screenshots: ${screenshotDir}`);
} finally {
  socket?.close();
  chrome.kill();
  await delay(300);
  // Only remove the unique browser profile created by this test inside root.
  if (profile.startsWith(root + "\\") && profile.includes(".chrome-test-")) {
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
    catch (error) { console.warn(`Temporary Chrome profile remains at ${profile}: ${error.message}`); }
  }
}
