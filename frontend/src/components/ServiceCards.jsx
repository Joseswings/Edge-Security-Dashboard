import Badge from "./Badge.jsx";
import Icon from "./Icon.jsx";
import { formatDate } from "../services/format.js";

export default function ServiceCards({ services, detailed = false }) {
  return (
    <div className={`service-grid ${detailed ? "detailed" : ""}`}>
      {services.map((service) => (
        <article className="service-card" key={service.id}>
          <div className="service-heading">
            <span className="icon-box">
              <Icon name="services" />
            </span>
            <Badge value={service.status} />
          </div>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <div className="service-footer">
            <span>{service.layer}</span>
            <span>Simulado</span>
          </div>
          {detailed && (
            <small className="service-date">
              Última comprobación simulada: {formatDate(service.checkedAt)}
            </small>
          )}
        </article>
      ))}
    </div>
  );
}
