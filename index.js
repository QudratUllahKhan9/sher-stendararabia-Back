require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// ======================
// DEBUG ENV
// ======================
console.log("ENV CHECK:", process.env.MONGO_URI);

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sher-stendararabia-front.vercel.app",
    ],
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.options("*", cors());

// ======================
// MONGO CLIENT
// ======================
const client = new MongoClient(process.env.MONGO_URI);

let db;
let collection;

// ======================
// CONNECT DB (SAFE)
// ======================
async function connectDB() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing");
  }

  if (!db) {
    await client.connect();
    db = client.db("standardarabia");
    collection = db.collection("certificates");
    console.log("Mongo Connected");
  }

  return collection;
}

// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("API Working 🚀");
});

// ======================
// GET ALL
// ======================
app.get("/certificates", async (req, res) => {
  try {
    const col = await connectDB();
    const data = await col.find({}).sort({ createdAt: -1 }).toArray();
    res.json(data);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// POST
// ======================
app.post("/certificates", async (req, res) => {
  try {
    const col = await connectDB();

    const {
      name,
      iqama,
      cardNo,
      expiry,
      issued,
      course,
    } = req.body;

    if (!name || !iqama || !cardNo || !expiry || !issued || !course) {
      return res.status(400).json({
        message: "Missing fields",
      });
    }

    const exist = await col.findOne({ cardNo });

    if (exist) {
      return res.status(400).json({
        message: "Card already exists",
      });
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
    console.log("POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ======================
// SERVER START (LOCAL ONLY)
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});