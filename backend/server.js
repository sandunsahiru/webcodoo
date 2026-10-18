require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// ── MongoDB ──────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI).then(() => console.log("MongoDB connected"));

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    phone: { type: String, index: true },
    name: String,
    items: [{ productSlug: String, productName: String, planLabel: String, price: Number, qty: Number }],
    total: Number,
    status: { type: String, default: "pending_payment" },
    posCustomerId: String,
  },
  { timestamps: true }
);
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

// ── Telegram Bot ─────────────────────────────────────────────────────────────
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Register your chat ID by messaging the bot and calling GET /setup-telegram
let ownerChatId = process.env.TELEGRAM_CHAT_ID || "";

bot.on("message", (msg) => {
  // Auto-save first message from any user as owner chat ID (one-time setup)
  if (!ownerChatId) {
    ownerChatId = String(msg.chat.id);
    console.log("Owner chat ID saved:", ownerChatId);
  }
});

// Start polling so bot can receive messages for setup
const botPolling = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
botPolling.on("message", (msg) => {
  if (!ownerChatId) ownerChatId = String(msg.chat.id);
});

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check
app.get("/", (req, res) => res.json({ status: "Webcodoo backend running" }));

// Get owner Telegram chat ID (send /start to bot first)
app.get("/setup-telegram", (req, res) => {
  res.json({ chatId: ownerChatId || "Not set yet. Message your bot first." });
});

// Phone lookup
app.post("/api/auth/lookup", async (req, res) => {
  try {
    const { phone } = req.body;
    const normalized = phone.replace(/\D/g, "");
    const variants = [
      normalized,
      normalized.replace(/^0/, "94"),
      normalized.replace(/^94/, "0"),
      "0" + normalized.slice(-9),
      "94" + normalized.slice(-9),
    ];

    const db = mongoose.connection.db;
    const customersCol = db.collection("customers");
    const customer = await customersCol.findOne({
      $or: variants.flatMap((v) => [
        { phone: v }, { mobile: v }, { contact: v },
        { phone: { $regex: v.slice(-9) } },
        { mobile: { $regex: v.slice(-9) } },
      ]),
    });

    let posOrders = 0;
    if (customer) {
      posOrders = await db.collection("orders").countDocuments({
        $or: [{ customer_id: customer._id }, { customerId: customer._id }],
      });
    }

    const webOrders = await Order.find({ phone: { $in: variants } }).sort({ createdAt: -1 }).limit(10).lean();

    res.json({
      found: !!customer,
      customer: customer ? { id: customer._id, name: customer.name ?? customer.customer_name ?? "", phone: normalized } : null,
      posOrders,
      webOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Create order
app.post("/api/orders", async (req, res) => {
  try {
    const { phone, name, items, posCustomerId } = req.body;
    if (!phone || !name || !items?.length) return res.status(400).json({ error: "Missing fields" });

    const total = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
    const orderId = `WCD-${date}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({ orderId, phone, name, items, total, posCustomerId, status: "pending_payment" });

    // Send Telegram notification
    if (ownerChatId) {
      const itemLines = items.map((i) => `  • ${i.productName} – ${i.planLabel} × ${i.qty || 1} = Rs. ${(i.price * (i.qty || 1)).toLocaleString()}`).join("\n");
      const msg = `🛒 <b>NEW ORDER</b> #${orderId}\n\n👤 ${name}\n📱 ${phone}\n💰 <b>Total: Rs. ${total.toLocaleString()}</b>\n\n📦 Items:\n${itemLines}\n\n💳 Awaiting bank payment\n⏰ ${new Date().toLocaleString("en-LK", { timeZone: "Asia/Colombo" })}`;
      await bot.sendMessage(ownerChatId, msg, { parse_mode: "HTML" }).catch(console.error);
    }

    res.json({ orderId, total, id: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get order by ID
app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id }).lean();
    if (!order) return res.status(404).json({ error: "Not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update order status
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOneAndUpdate({ orderId: req.params.id }, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Not found" });

    // Notify customer via Telegram if owner confirms/delivers
    if (ownerChatId && status === "delivered") {
      await bot.sendMessage(ownerChatId, `✅ Order #${order.orderId} marked as <b>delivered</b>`, { parse_mode: "HTML" }).catch(console.error);
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// List all orders (admin)
app.get("/api/admin/orders", async (req, res) => {
  try {
    const secret = req.headers["x-admin-key"];
    if (secret !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Unauthorized" });
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100).lean();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Webcodoo backend running on port ${PORT}`));
