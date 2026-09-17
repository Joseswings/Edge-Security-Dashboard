import app from "./app.js";

const port = Number(process.env.PORT || 3001);
const host = process.env.HOST || "127.0.0.1";
const server = app.listen(port, host, () => {
  console.log(`Edge Security API: http://${host}:${port}/api/status (mock)`);
});
server.on("error", (error) => {
  console.error(`No se pudo iniciar la API: ${error.message}`);
  process.exitCode = 1;
});

function shutdown(signal) {
  console.log(`${signal} recibido. Cerrando Edge Security API...`);
  server.close((error) => {
    if (error) {
      console.error(`Error durante el cierre: ${error.message}`);
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
