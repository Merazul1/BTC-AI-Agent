import axios from "axios";
import cron from "node-cron";
import "dotenv/config";

const SYMBOL = "BTCUSDT";
const INTERVAL = "1m";
const LIMIT = 20;

// ===============================
// 1️⃣ FETCH BTC PRICE DATA
// ===============================
async function fetchPrices() {
  const url = `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${INTERVAL}&limit=${LIMIT}`;
  const res = await axios.get(url);
  return res.data.map(candle => parseFloat(candle[4])); // closing prices
}

// ===============================
// 2️⃣ ANALYZE TREND
// ===============================
function movingAverage(data, period) {
  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

function analyzeTrend(prices) {
  const ma5 = movingAverage(prices, 5);
  const ma20 = movingAverage(prices, 20);

  if (ma5 > ma20) return "BUY";
  if (ma5 < ma20) return "SELL";
  return "HOLD";
}

// ===============================
// 3️⃣ PLACE TRADE (DEMO MODE)
// ===============================
async function placeTrade(action, price) {
  if (process.env.MODE === "DEMO") {
    return {
      status: "success",
      mode: "DEMO",
      action,
      price,
      amount: process.env.TRADE_AMOUNT
    };
  }

  // REAL TRADE LOGIC GOES HERE (Binance / Web3)
}

// ===============================
// 4️⃣ NOTIFY USER
// ===============================
function notifyUser(result) {
  console.log("📢 TRADE ALERT");
  console.log(`Action: ${result.action}`);
  console.log(`Price: ${result.price}`);
  console.log(`Amount: ${result.amount}`);
  console.log(`Mode: ${result.mode}`);
  console.log("----------------------");
}

// ===============================
// 5️⃣ AGENT LOOP
// ===============================
async function runAgent() {
  try {
    console.log("⏳ Running BTC AI Agent...");

    const prices = await fetchPrices();
    const latestPrice = prices[prices.length - 1];

    const decision = analyzeTrend(prices);

    console.log("📈 Decision:", decision);

    if (decision !== "HOLD") {
      const trade = await placeTrade(decision, latestPrice);
      notifyUser(trade);
    } else {
      console.log("🟡 HOLD – No trade executed");
    }

  } catch (err) {
    console.error("❌ Agent Error:", err.message);
  }
}

// ===============================
// 6️⃣ RUN EVERY 1 MINUTE
// ===============================
cron.schedule("*/1 * * * *", runAgent);

// Run once immediately
runAgent();
