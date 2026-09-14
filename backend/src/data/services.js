export const services = [
  {
    id: "suricata",
    name: "Suricata",
    status: "running",
    layer: "PaaS",
    description: "Motor de detección de intrusiones. Eventos EVE simulados.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
  {
    id: "api",
    name: "API",
    status: "running",
    layer: "PaaS",
    description: "Servicio de consulta para el dashboard.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
  {
    id: "database",
    name: "Database",
    status: "pending",
    layer: "PaaS",
    description: "PostgreSQL pendiente de integración. Datos en memoria.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
  {
    id: "vm",
    name: "Ubuntu Security VM",
    status: "running",
    layer: "IaaS",
    description: "ubuntu-security sobre KubeVirt/K3s en Raspberry Pi 5.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
];
