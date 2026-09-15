import { getAlerts } from "./alertService.js";
import { getServices } from "./serviceHealthService.js";

export function calculateStatus(alerts, services) {
  const active = alerts.filter((alert) => alert.status === "new");
  if (
    active.some((alert) => alert.severity === "CRITICAL") ||
    services.some((service) => ["stopped", "down"].includes(service.status))
  ) {
    return {
      status: "critical",
      label: "Crítico",
      message:
        "Hay alertas críticas nuevas o servicios caídos que requieren atención.",
    };
  }
  if (
    active.some((alert) => ["MEDIUM", "HIGH"].includes(alert.severity)) ||
    services.some((service) => service.status !== "running")
  ) {
    return {
      status: "warning",
      label: "Advertencia",
      message: "Hay alertas por revisar o servicios en estado de advertencia.",
    };
  }
  return {
    status: "safe",
    label: "Seguro",
    message:
      "Sin alertas nuevas de severidad media o superior. Servicios operativos.",
  };
}

export function getStatus() {
  return {
    ...calculateStatus(getAlerts(), getServices()),
    source: "mock",
    checkedAt: new Date().toISOString(),
  };
}
