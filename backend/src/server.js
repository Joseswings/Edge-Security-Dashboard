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
