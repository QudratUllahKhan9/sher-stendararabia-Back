const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// ====================
// CORS
// ====================
app.use(cors());

app.use(express.json());

// ====================
// MongoDB
// ====================
const client = new MongoClient(
  process.env.MONGO_URI
);

let collection;

// ====================
// DB CONNECT
// ====================
async function connectDB() {
  if (!collection) {

    await client.connect();

    const db = client.db(
      "standardarabia"
    );

    collection =
      db.collection("certificates");

    console.log("MongoDB Connected");
  }

  return collection;
}

// ====================
// DATE FORMAT
// ====================
const formatDate = (date) => {

  const d = new Date(date);

  const day = String(
    d.getDate()
  ).padStart(2, "0");

  const month = String(
    d.getMonth() + 1
  ).padStart(2, "0");

  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

// ====================
// HOME
// ====================
app.get("/", (req, res) => {
  res.send("Server Running");
});

// ====================
// GET
// ====================
app.get(
  "/certificates",
  async (req, res) => {

    try {

      const collection =
        await connectDB();

      const data =
        await collection
          .find({})
          .sort({
            createdAt: -1,
          })
          .toArray();

      res.json(data);

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ====================
// POST
// ====================
app.post(
  "/certificates",
  async (req, res) => {

    try {

      const collection =
        await connectDB();

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
          message:
            "All fields required",
        });
      }

      const exist =
        await collection.findOne({
          cardNo,
        });

      if (exist) {
        return res.status(400).json({
          message:
            "Card already exists",
        });
      }

      const result =
        await collection.insertOne({
          name,
          iqama,
          cardNo,
          expiry:
            formatDate(expiry),
          issued:
            formatDate(issued),
          course,
          createdAt:
            new Date(),
        });

      res.status(201).json({
        success: true,
        insertedId:
          result.insertedId,
      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// ====================
// EXPORT
// ====================
module.exports = app;