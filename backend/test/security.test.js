import test from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";
import { transformEvent } from "../src/services/alertService.js";
import { calculateStatus } from "../src/services/statusService.js";

test("transforma prioridades EVE y permite CRITICAL como clasificación explícita", () => {
  const event = {
    event_type: "alert",
    timestamp: "2026-09-14T20:30:00Z",
    src_ip: "192.168.1.20",
    dest_ip: "192.168.1.10",
    proto: "TCP",
    alert: { signature_id: 42, signature: "Test", severity: 1 },
  };
  assert.equal(transformEvent(event).severity, "HIGH");
  assert.equal(
    transformEvent({ ...event, alert: { ...event.alert, severity: 2 } })
      .severity,
    "MEDIUM",
  );
  assert.equal(
    transformEvent({ ...event, alert: { ...event.alert, severity: 3 } })
      .severity,
    "LOW",
  );
  assert.equal(
    transformEvent({ ...event, dashboard: { severity: "CRITICAL" } }).severity,
    "CRITICAL",
  );
  assert.equal(transformEvent(event).status, "new");
  assert.equal(transformEvent({ event_type: "dns" }), null);
});

test("estado considera alertas nuevas y disponibilidad de servicios", () => {
  const healthy = [{ status: "running" }];
  assert.equal(calculateStatus([], healthy).status, "safe");
  assert.equal(
    calculateStatus([{ severity: "CRITICAL", status: "reviewed" }], healthy)
      .status,
    "safe",
  );
  assert.equal(
    calculateStatus([{ severity: "HIGH", status: "new" }], healthy).status,
    "warning",
  );
  assert.equal(calculateStatus([], [{ status: "pending" }]).status, "warning");
  assert.equal(
    calculateStatus([{ severity: "CRITICAL", status: "new" }], healthy).status,
    "critical",
  );
  assert.equal(calculateStatus([], [{ status: "down" }]).status, "critical");
});

test("los cinco endpoints responden y sus métricas coinciden con los listados", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  const responses = await Promise.all(
    ["status", "summary", "alerts", "devices", "services"].map((path) =>
      fetch(`${base}/${path}`),
    ),
  );
  responses.forEach((response) => {
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /application\/json/);
  });
  const [status, summary, alerts, devices, services] = await Promise.all(
    responses.map((response) => response.json()),
  );
  assert.equal(status.label, "Crítico");
  assert.equal(summary.totalAlerts, alerts.length);
  assert.equal(summary.totalDevices, devices.length);
  assert.equal(
    summary.criticalAlerts,
    alerts.filter((alert) => alert.severity === "CRITICAL").length,
  );
  assert.equal(summary.totalServices, services.length);
  assert.equal(
    Object.values(summary.alertsBySeverity).reduce((a, b) => a + b, 0),
    alerts.length,
  );
  for (const device of devices) {
    assert.equal(
      device.eventCount,
      alerts.filter(
        (alert) =>
          alert.sourceIp === device.ip || alert.destinationIp === device.ip,
      ).length,
    );
  }
  const missing = await fetch(`${base}/missing`);
  assert.equal(missing.status, 404);
  assert.equal(typeof (await missing.json()).error, "string");
});
