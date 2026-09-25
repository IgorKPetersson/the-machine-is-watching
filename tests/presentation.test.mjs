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
  await screenshot("scene-01-1920.png");
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

  await click("#scene-1 .media-launch");
  await delay(150);
  assert.equal(await evaluate("document.querySelector('#media-modal').hidden"), false);
  assert.equal(await evaluate("document.querySelector('#media-missing').classList.contains('is-hidden')"), false);
  await click("#media-close");
  assert.equal(await evaluate("document.querySelector('#media-modal').hidden"), true);

  await right();
  assert.equal(await scene(), 2);
  await click("#previous-button");
  assert.equal(await scene(), 1);
  await click("#next-button");
  assert.equal(await scene(), 2);
  for (let i = 0; i < 4; i++) await space();
  assert.equal(await evaluate("document.querySelectorAll('#scene-2 .reveal.is-revealed').length"), 4);
  await checkLayout(1920, 1080);
  await right();
  assert.equal(await scene(), 3);
  for (const id of ["machine-cameras", "machine-phones", "machine-text", "machine-location", "machine-relations", "machine-ml"]) await click(`#${id}`);
  assert.equal(await text("#machine-status"), "SYSTEM READY");
  assert.equal(await evaluate("document.querySelectorAll('#scene-3 .wires .is-active').length"), 6);
  await screenshot("scene-03-1920.png");
  await click("#machine-reset");
  assert.equal(await text("#machine-status"), "DATA");
  await right();
  for (let i = 0; i < 3; i++) await space();
  assert.equal(await scene(), 4);
  assert.equal(await evaluate("document.querySelector('#scene-4 .snowden-reveal').classList.contains('is-revealed')"), true);
  await right();
  for (let i = 0; i < 3; i++) await click("#metadata-next");
  assert.equal(await text("#metadata-counter"), "04 / 04");
  assert.equal(await evaluate("document.querySelectorAll('#metadata-graph line').length"), 4);
  await right();
  assert.equal(await scene(), 6);
  assert.equal(await evaluate("document.querySelector('#build-llm').disabled"), true);
  for (const id of ["build-camera", "build-location", "build-communication", "build-identity", "build-text"]) await click(`#${id}`);
  assert.equal(await text("#builder-status-text"), "ANALYZING");
  assert.equal(await evaluate("document.querySelector('#build-llm').disabled"), false);
  await click("#build-llm");
  await click("#build-agent");
  assert.equal(await text("#builder-status-text"), "SITUATIONAL MODEL GENERATED");
  await screenshot("scene-06-1920.png");
  await click("#builder-reset");
  assert.equal(await text("#builder-status-text"), "SYSTEM OFFLINE");
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
  for (let i = 0; i < 6; i++) await click("#person-next");
  assert.equal(await text("#network-result"), "A NETWORK");
  await click("#person-b");
  assert.equal(await evaluate("document.querySelector('#person-b1').classList.contains('is-visible')"), true);
  await click("#person-c");
  assert.equal(await evaluate("document.querySelector('#person-c1').classList.contains('is-visible')"), true);
  await click(".tooltip-trigger");
  assert.equal(await evaluate("document.querySelector('.tooltip-trigger').getAttribute('aria-expanded')"), "true");
  await right();
  assert.equal(await scene(), 9);
  await right();
  assert.equal(await scene(), 10);
  await space();
  assert.equal(await text("#agent-mode-label"), "AGENT");
  await right();
  assert.equal(await scene(), 11);
  await click("[data-governance='state']");
  assert.ok((await text("#governance-description")).includes("legal frameworks"));
  await right();
  assert.equal(await scene(), 12);
  for (let i = 0; i < 6; i++) await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').dataset.numberPhase"), "6");
  await space();
  assert.equal(await evaluate("document.querySelector('#scene-12').dataset.numberPhase"), "6");
  await click("[data-choice='B']");
  assert.ok((await text("#choice-result")).includes("HUMAN REVIEW"));
  await click("#scene-12 .media-launch");
  await delay(100);
  assert.equal(await evaluate("document.querySelector('#media-missing').classList.contains('is-hidden')"), false);
  await click("#media-close");
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
    if (i === 2) assert.equal(await evaluate("document.querySelector('#scene-2 .image-fallback').getClientRects().length > 0"), true);
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
