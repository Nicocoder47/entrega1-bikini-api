import { readJson, writeJson, nextId } from "../lib/fileDb.js";

const FILE = "carts.json";

export default class CartManager {
  static async create() {
    const all = await readJson(FILE);
    const cart = { id: nextId(all), products: [], createdAt: new Date().toISOString() };
    all.push(cart);
    await writeJson(FILE, all);
    return cart;
  }

  static async findById(id) {
    const all = await readJson(FILE);
    return all.find(c => String(c.id) === String(id)) || null;
  }

  static async addProduct(cid, pid, quantity = 1) {
    const all = await readJson(FILE);
    const idx = all.findIndex(c => String(c.id) === String(cid));
    if (idx === -1) return null;

    const cart = all[idx];
    const item = cart.products.find(i => String(i.product) === String(pid));
    if (item) {
      item.quantity += 1;
    } else {
      cart.products.push({ product: String(pid), quantity: Math.max(1, Number(quantity) || 1) });
    }
    all[idx] = cart;
    await writeJson(FILE, all);
    return cart;
  }
}
