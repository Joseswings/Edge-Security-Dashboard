import { services } from "../data/services.js";

export function getServices() {
  // TODO: Replace mock service status with Docker healthchecks or systemctl checks.
  return services.map((service) => ({ ...service, source: "mock" }));
}
