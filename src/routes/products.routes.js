import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();

// GET /api/products
router.get("/", async (_req, res, next) => {
  try {
    const items = await ProductManager.findAll();
    res.json({ total: items.length, items });
  } catch (e) { next(e); }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res, next) => {
  try {
    const item = await ProductManager.findById(req.params.pid);
    if (!item) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(item);
  } catch (e) { next(e); }
});

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const created = await ProductManager.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res, next) => {
  try {
    const updated = await ProductManager.update(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (e) { next(e); }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res, next) => {
  try {
    const ok = await ProductManager.delete(req.params.pid);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(204).end();
  } catch (e) { next(e); }
});

// Manejo básico de errores
router.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error inesperado" });
});

export default router;
