import Icon from "../components/Icon.jsx";
import Badge from "../components/Badge.jsx";
import AlertsTable from "../components/AlertsTable.jsx";
import ServiceCards from "../components/ServiceCards.jsx";
import Architecture from "../components/Architecture.jsx";

export default function Overview({ data, navigate }) {
  const { status, summary, alerts, services } = data;
  const metrics = [
    {
      label: "Dispositivos detectados",
      value: summary.totalDevices,
      note: `${summary.onlineDevices} en línea`,
      icon: "devices",
    },
    {
      label: "Alertas registradas",
      value: summary.totalAlerts,
      note: `${summary.newAlerts} pendientes de revisión`,
      icon: "alerts",
    },
    {
      label: "Alertas críticas",
      value: summary.criticalAlerts,
      note: "En el conjunto de datos",
      icon: "shield",
      critical: true,
    },
    {
      label: "Servicios operativos",
      value: `${summary.runningServices}/${summary.totalServices}`,
      note: "Estado de servicios simulado",
      icon: "services",
    },
  ];
  return (
    <>
      <section className={`status-banner status-${status.status}`}>
        <span className="status-symbol">
          <Icon name="shield" size={28} />
        </span>
        <div>
          <div className="status-title">
            <h2>Estado del sistema</h2>
            <Badge value={status.status} />
          </div>
          <p>{status.message}</p>
        </div>
        <button className="text-button" onClick={() => navigate("alerts")}>
          Revisar alertas <Icon name="arrow" size={17} />
        </button>
      </section>
      <section className="metrics" aria-label="Métricas principales">
        {metrics.map((metric) => (
          <article
            className={`metric ${metric.critical ? "metric-critical" : ""}`}
            key={metric.label}
          >
            <div className="metric-heading">
              <span>{metric.label}</span>
              <Icon name={metric.icon} />
            </div>
            <strong className="metric-value">{metric.value}</strong>
            <span className="metric-note">{metric.note}</span>
          </article>
        ))}
      </section>
      <div className="overview-middle">
        <section className="panel severity-panel">
          <div className="section-heading">
            <div>
              <h2>Distribución de alertas</h2>
              <p>Severidad de todos los eventos registrados</p>
            </div>
          </div>
          <div className="severity-bars">
            {Object.entries(summary.alertsBySeverity).map(
              ([severity, count]) => (
                <div className="severity-row" key={severity}>
                  <Badge value={severity} />
                  <div className="bar-track">
                    <div
                      className={`bar-fill bar-${severity.toLowerCase()}`}
                      style={{
                        width: `${summary.totalAlerts ? (count / summary.totalAlerts) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              ),
            )}
          </div>
        </section>
        <section className="network-note">
          <span className="eyebrow">ENTORNO DE DESARROLLO</span>
          <Icon name="shield" size={44} />
          <h2>Visibilidad desde el edge.</h2>
          <p>
            Alertas, dispositivos y servicios reunidos para entender la
            seguridad de tu red.
          </p>
          <span className="network-note-footer">
            <span className="live-dot" /> API local · Datos mock
          </span>
        </section>
      </div>
      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Últimas alertas</h2>
            <p>Los cinco eventos más recientes · Hora local</p>
          </div>
          <button className="text-button" onClick={() => navigate("alerts")}>
            Ver todas <Icon name="arrow" size={17} />
          </button>
        </div>
        <AlertsTable alerts={alerts.slice(0, 5)} />
      </section>
      <section>
        <div className="section-heading outside">
          <div>
            <h2>Estado de servicios</h2>
            <p>Componentes de la infraestructura</p>
          </div>
          <button className="text-button" onClick={() => navigate("services")}>
            Ver detalles <Icon name="arrow" size={17} />
          </button>
        </div>
        <ServiceCards services={services} />
      </section>
      <Architecture />
    </>
  );
}
