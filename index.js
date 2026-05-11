const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

app.use(cors({
  origin: "https://sher-stendararabia-front.vercel.app"
}));

app.use(express.json());

// ======================
// MONGO (GLOBAL SAFE)
// ======================
const client = new MongoClient(process.env.MONGO_URI);

let db;
let collection;

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
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Backend Working");
});

// ======================
// GET
// ======================
app.get("/certificates", async (req, res) => {
  try {
    const col = await connectDB();
    const data = await col.find({}).toArray();
    res.json(data);
  } catch (err) {
    console.log(err);
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
      course
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
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      id: result.insertedId
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = app;