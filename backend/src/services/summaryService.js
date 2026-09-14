import { getAlerts } from "./alertService.js";
import { getDevices } from "./deviceService.js";
import { getServices } from "./serviceHealthService.js";

export function getSummary() {
  const alerts = getAlerts();
  const devices = getDevices();
  const services = getServices();
  return {
    source: "mock",
    totalDevices: devices.length,
    onlineDevices: devices.filter((device) => device.status === "online")
      .length,
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter((alert) => alert.severity === "CRITICAL")
      .length,
    newAlerts: alerts.filter((alert) => alert.status === "new").length,
    runningServices: services.filter((service) => service.status === "running")
      .length,
    totalServices: services.length,
    alertsBySeverity: Object.fromEntries(
      ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((severity) => [
        severity,
        alerts.filter((alert) => alert.severity === severity).length,
      ]),
    ),
  };
}
