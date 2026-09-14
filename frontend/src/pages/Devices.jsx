import { useState } from "react";
import Badge from "../components/Badge.jsx";
import Icon from "../components/Icon.jsx";
import { formatDate } from "../services/format.js";

export default function Devices({ devices }) {
  const [query, setQuery] = useState("");
  const filtered = devices.filter((device) =>
    [device.ip, device.hostname, device.mac].some((value) =>
      value.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Dispositivos de la red</h2>
          <p>
            {filtered.length} de {devices.length} dispositivos · Inventario
            simulado
          </p>
        </div>
      </div>
      <div className="filters">
        <label className="search-field">
          <span className="sr-only">Buscar dispositivos</span>
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por hostname, IP o MAC…"
          />
        </label>
      </div>
      {!filtered.length ? (
        <div className="empty-state">No se encontraron dispositivos.</div>
      ) : (
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Tabla de dispositivos, desplazable horizontalmente"
        >
          <table>
            <thead>
              <tr>
                <th>Hostname</th>
                <th>Dirección IP</th>
                <th>MAC simulada</th>
                <th>Estado</th>
                <th>Última vez visto</th>
                <th>Eventos asociados</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => (
                <tr key={device.id}>
                  <td>
                    <strong>{device.hostname}</strong>
                  </td>
                  <td className="mono">{device.ip}</td>
                  <td className="mono">{device.mac}</td>
                  <td>
                    <Badge value={device.status} />
                  </td>
                  <td>{formatDate(device.lastSeen)}</td>
                  <td>{device.eventCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="table-note">
        Eventos asociados: alertas donde el dispositivo aparece como origen o
        destino. Fechas en hora local.
      </p>
    </section>
  );
}
