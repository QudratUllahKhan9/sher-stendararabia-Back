const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());

// 🔥 FIXED CORS (NO PRE-FLIGHT ISSUE)
app.use(
  cors({
    origin: "https://sher-stendararabia-front.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.options("*", cors());

// ======================
const client = new MongoClient(process.env.MONGO_URI);

let collection;

async function connectDB() {
  if (!collection) {
    await client.connect();
    const db = client.db("standardarabia");
    collection = db.collection("certificates");
  }
  return collection;
}

// ======================
app.get("/", (req, res) => {
  res.send("API Working");
});

// ======================
app.get("/certificates", async (req, res) => {
  try {
    const col = await connectDB();
    const data = await col.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ======================
app.post("/certificates", async (req, res) => {
  try {
    const col = await connectDB();

    const { name, iqama, cardNo, expiry, issued, course } = req.body;

    if (!name || !iqama || !cardNo || !expiry || !issued || !course) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exist = await col.findOne({ cardNo });

    if (exist) {
      return res.status(400).json({ message: "Card already exists" });
    }

    const result = await col.insertOne({
      name,
      iqama,
      cardNo,
      expiry,
      issued,
      course,
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      id: result.insertedId,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;