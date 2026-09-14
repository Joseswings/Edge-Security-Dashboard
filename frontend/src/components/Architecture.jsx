export default function Architecture() {
  return (
    <section className="architecture" aria-label="Arquitectura Cloud">
      <div>
        <span className="eyebrow">EDGE CYBERSECURITY CLOUD</span>
        <h2>Tres capas. Una sola vista.</h2>
      </div>
      <div className="architecture-layer">
        <span>IaaS</span>
        <p>Ubuntu Security VM sobre KubeVirt/K3s.</p>
      </div>
      <div className="architecture-layer">
        <span>PaaS</span>
        <p>Docker + Suricata + API + Database.</p>
      </div>
      <div className="architecture-layer">
        <span>SaaS</span>
        <p>Edge Security Dashboard.</p>
      </div>
    </section>
  );
}
