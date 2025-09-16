import express from "express";
import productsRouter from "./routes/products.routes.js";
import cartsRouter from "./routes/carts.routes.js";

const app = express();

// ─────────────────────────────────────────────────────────
// Config básica
// ─────────────────────────────────────────────────────────
app.set("x-powered-by", false);
app.disable("etag");
const PORT = Number(process.env.PORT) || 8080;
const API_PREFIX = "/api";

// Body parser 
app.use(express.json({ limit: "1mb" }));

// Logging 
app.use((req, _res, next) => {
  const started = Date.now();
  _res.on("finish", () => {
    const ms = Date.now() - started;
    console.log(`${req.method} ${req.originalUrl} → ${_res.statusCode} (${ms}ms)`);
  });
  next();
});

// CORS básico
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ─────────────────────────────────────────────────────────
// Rutas
// ─────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "bikini-ecommerce-api-fs",
    version: "1.0.0",
    tag: "bikinis",             
    ts: new Date().toISOString(),
  });
});

app.use(`${API_PREFIX}/products`, productsRouter);
app.use(`${API_PREFIX}/carts`, cartsRouter);

// 404 global
app.use((req, res, _next) => {
  res.status(404).json({
    error: "Not Found",
    path: req.originalUrl,
    method: req.method,
  });
});

// ─────────────────────────────────────────────────────────
// centralizado de errores
// ─────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "JSON malformado" });
  }
  const status = err.status || 500;
  const payload = { error: err.message || "Error inesperado" };
  if (process.env.NODE_ENV !== "production") payload.stack = err.stack;
  res.status(status).json(payload);
});

// ─────────────────────────────────────────────────────────
// Inicio del servidor + graceful shutdown
// ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

const shutdown = (signal) => {
  console.log(`\n🔻 Recibido ${signal}, cerrando servidor...`);
  server.close(() => {
    console.log("✅ Servidor cerrado correctamente.");
    process.exit(0);
  });
};
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
