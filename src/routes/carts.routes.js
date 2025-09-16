import { Router } from "express";
import CartManager from "../managers/CartManager.js";

const router = Router();

// POST /api/carts
router.post("/", async (_req, res, next) => {
  try {
    const cart = await CartManager.create();
    res.status(201).json(cart);
  } catch (e) { next(e); }
});

// GET /api/carts/:cid
router.get("/:cid", async (req, res, next) => {
  try {
    const cart = await CartManager.findById(req.params.cid);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(cart);
  } catch (e) { next(e); }
});

// POST /api/carts/:cid/product/:pid
router.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartManager.addProduct(cid, pid, 1);
    if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
    res.status(201).json(cart);
  } catch (e) { next(e); }
});

// Manejo básico de errores
router.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error inesperado" });
});

export default router;
