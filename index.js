const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// ======================
// CORS (IMPORTANT)
// ======================
app.use(
  cors({
    origin:
      "https://sher-stendararabia-front.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

// ======================
// DB
// ======================
const client = new MongoClient(
  process.env.MONGO_URI
);

let collection;

// ======================
// CONNECT DB
// ======================
async function connectDB() {
  if (!collection) {
    await client.connect();
    const db = client.db("standardarabia");
    collection = db.collection("certificates");
  }
  return collection;
}

// ======================
// HOME
// ======================
app.get("/", (req, res) => {
  res.send("Backend Working");
});

// ======================
// GET
// ======================
app.get("/certificates", async (req, res) => {
  const col = await connectDB();

  const data = await col
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  res.json(data);
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

    if (
      !name ||
      !iqama ||
      !cardNo ||
      !expiry ||
      !issued ||
      !course
    ) {
      return res.status(400).json({
        message: "All fields required",
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
    res.status(500).json({
      message: err.message,
    });
  }
});

// ======================
// EXPORT
// ======================
module.exports = app;