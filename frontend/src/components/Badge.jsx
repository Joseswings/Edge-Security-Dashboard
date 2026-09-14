const labels = {
  running: "Operativo",
  pending: "Pendiente",
  down: "Caído",
  online: "En línea",
  offline: "Desconectado",
  safe: "Seguro",
  warning: "Advertencia",
  critical: "Crítico",
};

export default function Badge({ value }) {
  return (
    <span className={`badge badge-${value.toLowerCase()}`}>
      <span className="badge-dot" />
      {labels[value] || value}
    </span>
  );
}
