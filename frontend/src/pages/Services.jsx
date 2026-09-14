import ServiceCards from "../components/ServiceCards.jsx";
import Architecture from "../components/Architecture.jsx";

export default function Services({ services }) {
  return (
    <>
      <div className="info-note">
        Estos estados son simulados. No se realizan comprobaciones reales de
        Suricata, Docker, PostgreSQL ni de la VM.
      </div>
      <ServiceCards services={services} detailed />
      <Architecture />
    </>
  );
}
