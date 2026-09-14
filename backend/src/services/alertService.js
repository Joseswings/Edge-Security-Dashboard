import { events } from "../data/events.js";

const severityMap = { 1: "HIGH", 2: "MEDIUM", 3: "LOW" };
const severities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const statuses = ["new", "reviewed", "ignored"];

export function transformEvent(event) {
  if (event.event_type !== "alert" || !event.alert) return null;
  return {
    id:
      event.id ??
      `${event.timestamp}-${event.flow_id ?? ""}-${event.alert.signature_id}`,
    signature: event.alert.signature,
    category: event.alert.category,
    // CRITICAL es una clasificación del dashboard, no una prioridad EVE nativa.
    severity: severities.includes(event.dashboard?.severity)
      ? event.dashboard.severity
      : (severityMap[event.alert.severity] ?? "MEDIUM"),
    sourceIp: event.src_ip,
    destinationIp: event.dest_ip,
    protocol: event.proto,
    timestamp: event.timestamp,
    status: statuses.includes(event.dashboard?.status)
      ? event.dashboard.status
      : "new",
  };
}

export function getAlerts() {
  // TODO: Replace mock data with Suricata eve.json reader.
  return events
    .map(transformEvent)
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
}
