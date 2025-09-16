import { readJson, writeJson, nextId } from "../lib/fileDb.js";

const FILE = "products.json";

function validateProduct(input, { partial = false } = {}) {
  const required = ["title", "description", "code", "price", "status", "stock", "category"];
  if (!partial) {
    for (const k of required) {
      if (input[k] === undefined) {
        const err = new Error(`Campo requerido faltante: ${k}`);
        err.status = 400;
        throw err;
      }
    }
  }
  if (input.price !== undefined && !(typeof input.price === "number" && input.price >= 0)) {
    const err = new Error("El campo 'price' debe ser número >= 0");
    err.status = 400;
    throw err;
  }
  if (input.stock !== undefined && !(Number.isInteger(input.stock) && input.stock >= 0)) {
    const err = new Error("El campo 'stock' debe ser entero >= 0");
    err.status = 400;
    throw err;
  }
  if (input.status !== undefined && typeof input.status !== "boolean") {
    const err = new Error("El campo 'status' debe ser booleano");
    err.status = 400;
    throw err;
  }
}

export default class ProductManager {
  static async findAll() {
    return await readJson(FILE);
  }

  static async findById(id) {
    const all = await readJson(FILE);
    return all.find(p => String(p.id) === String(id)) || null;
  }

  static async create(input) {
    validateProduct(input);
    const all = await readJson(FILE);
    if (all.some(p => p.code === input.code)) {
      const err = new Error("El campo 'code' debe ser único");
      err.status = 400;
      throw err;
    }
    const product = {
      id: nextId(all),
      title: input.title,
      description: input.description,
      code: input.code,
      price: input.price,
      status: input.status,
      stock: input.stock,
      category: input.category,
      thumbnails: Array.isArray(input.thumbnails) ? input.thumbnails : [],
      createdAt: new Date().toISOString()
    };
    all.push(product);
    await writeJson(FILE, all);
    return product;
  }

  static async update(id, patch) {
    validateProduct(patch, { partial: true });
    const all = await readJson(FILE);
    const idx = all.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return null;

    // no permitir cambio de id
    const { id: _ignored, ...rest } = patch;
    const merged = { ...all[idx], ...rest };
    // si cambiaron code, validar unicidad
    if (rest.code && all.some(p => p.code === rest.code && String(p.id) !== String(id))) {
      const err = new Error("El campo 'code' debe ser único");
      err.status = 400;
      throw err;
    }
    all[idx] = merged;
    await writeJson(FILE, all);
    return merged;
  }

  static async delete(id) {
    const all = await readJson(FILE);
    const next = all.filter(p => String(p.id) !== String(id));
    const deleted = next.length !== all.length;
    if (deleted) await writeJson(FILE, next);
    return deleted;
  }
}
