const endpoint = "http://127.0.0.1:9350";
const url = "http://127.0.0.1:8125/index.html";

async function request(path, options = {}) {
  const response = await fetch(endpoint + path, options);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function openPage(width) {
  const target = await request(`/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();

  ws.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (!data.id || !pending.has(data.id)) return;
    const callbacks = pending.get(data.id);
    pending.delete(data.id);
    data.error ? callbacks.reject(new Error(data.error.message)) : callbacks.resolve(data.result);
  });

  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }));

  function send(method, params = {}) {
    const callId = ++id;
    ws.send(JSON.stringify({ id: callId, method, params }));
    return new Promise((resolve, reject) => pending.set(callId, { resolve, reject }));
  }

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 768
  });
  await send("Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 900));

  const result = await send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const stats = document.querySelector(".feature-stats");
      const items = [...document.querySelectorAll(".feature-stat")];
      const rects = items.map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        };
      });
      const rows = [...new Set(rects.map((rect) => rect.top))].length;
      const colsFirstRow = rects.filter((rect) => rect.top === rects[0].top).length;
      return {
        width: ${width},
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        gridTemplateColumns: getComputedStyle(stats).gridTemplateColumns,
        rows,
        colsFirstRow,
        rects
      };
    })()`
  });

  ws.close();
  await request(`/json/close/${target.id}`);
  return result.result.value;
}

const widths = [768, 430, 390, 360];
const report = [];

for (const width of widths) {
  report.push(await openPage(width));
}

const problems = report.filter((item) => item.overflow > 1 || item.colsFirstRow !== 2 || item.rows !== 2);
console.log(JSON.stringify({ problems, report }, null, 2));
