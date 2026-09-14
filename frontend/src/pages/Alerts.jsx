import { useState } from "react";
import AlertsTable from "../components/AlertsTable.jsx";
import Icon from "../components/Icon.jsx";

export default function Alerts({ alerts }) {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = alerts.filter(
    (alert) =>
      (severity === "all" || alert.severity === severity) &&
      (status === "all" || alert.status === status) &&
      [
        alert.signature,
        alert.sourceIp,
        alert.destinationIp,
        alert.protocol,
      ].some((value) =>
        value.toLowerCase().includes(query.trim().toLowerCase()),
      ),
  );

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Registro de alertas</h2>
          <p>
            {filtered.length} de {alerts.length} eventos · Hora local
          </p>
        </div>
      </div>
      <div className="filters">
        <label className="search-field">
          <span className="sr-only">Buscar alertas</span>
          <Icon name="search" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por firma, IP o protocolo…"
          />
        </label>
        <label className="select-field">
          Severidad
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value)}
          >
            <option value="all">Todas</option>
            {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="select-field">
          Estado
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">Todos</option>
            {["new", "reviewed", "ignored"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <button
          className="secondary-button"
          onClick={() => {
            setQuery("");
            setSeverity("all");
            setStatus("all");
          }}
        >
          Limpiar
        </button>
      </div>
      <AlertsTable alerts={filtered} />
    </section>
  );
}
