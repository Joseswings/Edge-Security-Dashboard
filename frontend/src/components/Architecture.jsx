export default function Architecture() {
  return (
    <section className="architecture" aria-labelledby="cloud-service-model-title">
      <div className="architecture-intro">
        <span className="architecture-kicker">ARQUITECTURA DEL PROYECTO</span>
        <h2 id="cloud-service-model-title">Cloud Service Model</h2>
        <p>Del hardware en el edge a la experiencia del usuario.</p>
      </div>
      <div className="architecture-layer">
        <span className="layer-index">01</span>
        <div><strong>IaaS</strong><p>Ubuntu Security VM sobre KubeVirt.</p></div>
      </div>
      <div className="architecture-layer">
        <span className="layer-index">02</span>
        <div><strong>PaaS</strong><p>Docker + Suricata + API + Database.</p></div>
      </div>
      <div className="architecture-layer">
        <span className="layer-index">03</span>
        <div><strong>SaaS</strong><p>Edge Security Dashboard.</p></div>
      </div>
    </section>
  );
}
