import { devices } from "../data/devices.js";
import { getAlerts } from "./alertService.js";

export function getDevices() {
  // TODO: Replace mock data with PostgreSQL queries.
  const alerts = getAlerts();
  return devices.map((device) => ({
    ...device,
    eventCount: alerts.filter(
      (alert) =>
        alert.sourceIp === device.ip || alert.destinationIp === device.ip,
    ).length,
  }));
}
