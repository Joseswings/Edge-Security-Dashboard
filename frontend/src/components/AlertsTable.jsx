import Badge from "./Badge.jsx";
import { formatDate } from "../services/format.js";

export default function AlertsTable({ alerts }) {
  if (!alerts.length)
    return (
      <div className="empty-state">
        No hay alertas que coincidan con los filtros.
      </div>
    );
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Tabla de alertas, desplazable horizontalmente"
    >
      <table>
        <thead>
          <tr>
            <th>Severidad</th>
            <th>Firma de alerta</th>
            <th>IP origen</th>
            <th>IP destino</th>
            <th>Protocolo</th>
            <th>Fecha / hora</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              className={`alert-row alert-row-${alert.severity.toLowerCase()}`}
            >
              <td>
                <Badge value={alert.severity} />
              </td>
              <td className="signature">
                <strong>{alert.signature}</strong>
                <small>{alert.category}</small>
              </td>
              <td className="mono">{alert.sourceIp}</td>
              <td className="mono">{alert.destinationIp}</td>
              <td>
                <span className="protocol">{alert.protocol}</span>
              </td>
              <td className="date-cell">{formatDate(alert.timestamp)}</td>
              <td>
                <Badge value={alert.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
