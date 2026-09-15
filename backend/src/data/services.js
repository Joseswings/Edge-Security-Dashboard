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
    status: "warning",
    layer: "PaaS",
    description:
      "Persistirá alertas, dispositivos y estados. PostgreSQL aún no está conectado.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
  {
    id: "vm",
    name: "Ubuntu Security VM",
    status: "running",
    layer: "IaaS",
    description:
      "Máquina Ubuntu Security que ejecutará los servicios sobre KubeVirt.",
    checkedAt: "2026-09-14T20:31:00Z",
  },
];
