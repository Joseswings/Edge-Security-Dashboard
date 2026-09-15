import Badge from "./Badge.jsx";
import Icon from "./Icon.jsx";
import { formatDate } from "../services/format.js";

export default function DeviceSnapshot({ devices, navigate }) {
  return (
    <section className="panel device-snapshot">
      <div className="section-heading">
        <div>
          <h2>Dispositivos detectados</h2>
          <p>Actividad reciente en la red protegida</p>
        </div>
        <button className="text-button" onClick={() => navigate("devices")}>
          Ver inventario <Icon name="arrow" size={17} />
        </button>
      </div>
      <div className="device-list">
        {devices.slice(0, 4).map((device) => (
          <article className="device-list-item" key={device.id}>
            <span className="device-avatar">
              <Icon name="devices" size={18} />
            </span>
            <div className="device-identity">
              <strong>{device.hostname}</strong>
              <span className="mono">{device.ip}</span>
            </div>
            <div className="device-activity">
              <span>{formatDate(device.lastSeen)}</span>
              <small>{device.eventCount} eventos asociados</small>
            </div>
            <Badge value={device.status} />
          </article>
        ))}
      </div>
    </section>
  );
}
