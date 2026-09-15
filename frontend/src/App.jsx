import { useEffect, useState } from "react";
import Icon from "./components/Icon.jsx";
import Overview from "./pages/Overview.jsx";
import Alerts from "./pages/Alerts.jsx";
import Devices from "./pages/Devices.jsx";
import Services from "./pages/Services.jsx";
import Architecture from "./components/Architecture.jsx";
import { useDashboard } from "./services/useDashboard.js";

const pages = {
  overview: {
    label: "Overview",
    title: "Resumen de seguridad",
    description: "Una vista completa de tu entorno Edge Cybersecurity Cloud.",
  },
  alerts: {
    label: "Alerts",
    title: "Alertas de seguridad",
    description:
      "Explora los eventos detectados y encuentra lo que requiere atención.",
  },
  devices: {
    label: "Devices",
    title: "Dispositivos",
    description: "Conoce los equipos detectados y su actividad en la red.",
  },
  services: {
    label: "Services",
    title: "Servicios",
    description: "Consulta el estado de los componentes de tu infraestructura.",
  },
};
const readPage = () =>
  Object.hasOwn(pages, window.location.hash.slice(1))
    ? window.location.hash.slice(1)
    : "overview";

export default function App() {
  const [page, setPage] = useState(readPage);
  const { data, loading, error, updatedAt, refresh } = useDashboard();
  useEffect(() => {
    const handleHash = () => setPage(readPage());
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  useEffect(() => {
    document.title = `${pages[page].label} · Edge Security Dashboard`;
  }, [page]);
  const navigate = (next) => {
    window.location.hash = next;
  };

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content").focus();
        }}
      >
        Saltar al contenido
      </a>
      <aside className="sidebar">
        <a className="brand" href="#overview">
          <span className="brand-icon">
            <Icon name="shield" size={27} />
          </span>
          <span>
            EDGE<span className="brand-subtitle">SECURITY DASHBOARD</span>
          </span>
        </a>
        <div className="workspace-label">
          WORKSPACE <span>LOCAL</span>
        </div>
        <div className="workspace-name">
          Edge Cybersecurity Cloud<small>Entorno de desarrollo</small>
        </div>
        <div className="nav-heading">MONITOREO</div>
        <nav aria-label="Navegación principal">
          {Object.entries(pages).map(([key, item]) => (
            <a
              key={key}
              href={`#${key}`}
              className={`nav-link ${page === key ? "active" : ""}`}
              aria-current={page === key ? "page" : undefined}
            >
              <Icon name={key} />
              <span>{item.label}</span>
              {key === "alerts" && data && (
                <span className="nav-count">{data.summary.totalAlerts}</span>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-device">
            <Icon name="services" />
            <span>
              Raspberry Pi 5<small>KubeVirt / K3s · Ubuntu VM</small>
            </span>
          </span>
          <div className="sidebar-version">
            EDGE CLOUD <span>MVP / 1.0</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{pages[page].label}</strong>
          </div>
          <span className="mock-label">
            <span className="live-dot" /> DATOS MOCK
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <span className="eyebrow">EDGE SECURITY DASHBOARD</span>
              <h1>{pages[page].title}</h1>
              <p>{pages[page].description}</p>
            </div>
            <button
              className="primary-button"
              onClick={refresh}
              disabled={loading}
            >
              <Icon
                name="refresh"
                size={17}
                className={loading ? "spin" : ""}
              />
              {loading ? "Cargando…" : "Actualizar"}
            </button>
          </div>
          <div className="data-context">
            <span>Demo local · Telemetría simulada</span>
            <span>
              {updatedAt
                ? `Última consulta: ${updatedAt.toLocaleTimeString("es-GT")}`
                : "Conectando con la API…"}
            </span>
          </div>
          {error && (
            <div className="error-state" role="alert">
              <Icon name="alerts" />
              <div>
                <strong>No se pudieron actualizar los datos</strong>
                <p>{error}</p>
                {data && (
                  <p>
                    Se muestran los últimos datos recibidos; pueden estar
                    desactualizados.
                  </p>
                )}
              </div>
              <button
                className="secondary-button"
                onClick={refresh}
                disabled={loading}
              >
                Reintentar
              </button>
            </div>
          )}
          {loading && !data && (
            <div className="loading-state" role="status">
              <Icon name="refresh" size={30} className="spin" />
              <h2>Cargando tu entorno</h2>
              <p>Consultando estado, alertas, dispositivos y servicios…</p>
            </div>
          )}
          {data && (
            <div className="page-content" aria-busy={loading}>
              {page === "overview" && (
                <Overview data={data} navigate={navigate} />
              )}
              {page === "alerts" && <Alerts alerts={data.alerts} />}
              {page === "devices" && <Devices devices={data.devices} />}
              {page === "services" && <Services services={data.services} />}
            </div>
          )}
          <div className="cloud-model-slot">
            <Architecture />
          </div>
          <footer className="main-footer">
            <span>Edge Cybersecurity Cloud</span>
            <span>MVP · Telemetría mock · Solo lectura</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
