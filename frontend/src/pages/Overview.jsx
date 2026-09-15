import AlertsTable from "../components/AlertsTable.jsx";
import Badge from "../components/Badge.jsx";
import DeviceSnapshot from "../components/DeviceSnapshot.jsx";
import Icon from "../components/Icon.jsx";
import ServiceCards from "../components/ServiceCards.jsx";

export default function Overview({ data, navigate }) {
  const { status, summary, alerts, devices, services } = data;
  const metrics = [
    {
      label: "System Status",
      value: status.label,
      note: "Nivel de riesgo actual",
      icon: "shield",
      tone: status.status,
    },
    {
      label: "Total Alerts",
      value: summary.totalAlerts,
      note: `${summary.newAlerts} pendientes de revisión`,
      icon: "alerts",
    },
    {
      label: "Critical Alerts",
      value: summary.criticalAlerts,
      note: "Requieren atención inmediata",
      icon: "pulse",
      tone: "critical",
    },
    {
      label: "Devices Online",
      value: `${summary.onlineDevices}/${summary.totalDevices}`,
      note: "Equipos activos en la red",
      icon: "wifi",
    },
    {
      label: "Services Running",
      value: `${summary.runningServices}/${summary.totalServices}`,
      note: "Componentes operativos",
      icon: "services",
    },
  ];

  return (
    <>
      <section className="metrics" aria-label="Métricas principales">
        {metrics.map((metric) => (
          <article
            className={`metric ${metric.tone ? `metric-${metric.tone}` : ""}`}
            key={metric.label}
          >
            <div className="metric-heading">
              <span>{metric.label}</span>
              <span className="metric-icon">
                <Icon name={metric.icon} />
              </span>
            </div>
            <div className="metric-value-row">
              <strong className="metric-value">{metric.value}</strong>
              {metric.label === "System Status" && (
                <Badge value={status.status} />
              )}
            </div>
            <span className="metric-note">{metric.note}</span>
          </article>
        ))}
      </section>

      <section className={`security-callout status-${status.status}`}>
        <div className="security-callout-copy">
          <span className="status-symbol">
            <Icon name="shield" size={25} />
          </span>
          <div>
            <span className="eyebrow">SECURITY POSTURE</span>
            <h2>{status.message}</h2>
          </div>
        </div>
        <button className="text-button" onClick={() => navigate("alerts")}>
          Revisar alertas <Icon name="arrow" size={17} />
        </button>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Alertas recientes</h2>
            <p>Los cinco eventos más recientes · Hora local</p>
          </div>
          <button className="text-button" onClick={() => navigate("alerts")}>
            Ver todas <Icon name="arrow" size={17} />
          </button>
        </div>
        <AlertsTable alerts={alerts.slice(0, 5)} />
      </section>

      <div className="overview-middle">
        <DeviceSnapshot devices={devices} navigate={navigate} />
        <section className="panel severity-panel">
          <div className="section-heading">
            <div>
              <h2>Distribución de alertas</h2>
              <p>Eventos agrupados por severidad</p>
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
      </div>

      <section>
        <div className="section-heading outside">
          <div>
            <h2>Estado de servicios</h2>
            <p>Componentes principales de la infraestructura</p>
          </div>
          <button className="text-button" onClick={() => navigate("services")}>
            Ver detalles <Icon name="arrow" size={17} />
          </button>
        </div>
        <ServiceCards services={services} />
      </section>
    </>
  );
}
