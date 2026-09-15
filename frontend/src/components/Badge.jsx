const labels = {
  running: "Running",
  stopped: "Stopped",
  pending: "Pendiente",
  down: "Caído",
  online: "Online",
  offline: "Offline",
  safe: "Seguro",
  warning: "Warning",
  critical: "Crítico",
};

export default function Badge({ value }) {
  const normalizedValue = String(value).toLowerCase();
  return (
    <span className={`badge badge-${normalizedValue}`}>
      <span className="badge-dot" />
      {labels[normalizedValue] || value}
    </span>
  );
}
