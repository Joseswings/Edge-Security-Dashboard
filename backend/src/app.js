import express from "express";
import securityRoutes from "./routes/securityRoutes.js";

const app = express();
app.disable("x-powered-by");
app.use(
  "/api",
  (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  },
  securityRoutes,
);
app.use((_req, res) =>
  res.status(404).json({ error: "Endpoint no encontrado." }),
);
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "No fue posible procesar la solicitud." });
});
export default app;
