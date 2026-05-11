const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());

// ======================
// CORS SAFE
// ======================
app.use(
  cors({
    origin: "https://sher-stendararabia-front.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.options("*", cors());

// ======================
// MONGO (IMPORTANT FIX)
// ======================
const client = new MongoClient(process.env.MONGO_URI, {
  maxPoolSize: 10,
});

let db;
let collection;

// connect once only
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("standardarabia");
    collection = db.collection("certificates");
    console.log("Mongo Connected");
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
    console.log("GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

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
    console.log("POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;