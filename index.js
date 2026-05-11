const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();

// =========================
// CORS
// =========================
app.use(
  cors({
    origin:
      "https://sher-stendararabia-front.vercel.app",
  })
);

app.use(express.json());

// =========================
// MONGODB
// =========================
const client = new MongoClient(
  process.env.MONGO_URI
);

// =========================
// DATE FORMAT
// =========================
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

// =========================
// CONNECT DATABASE
// =========================
async function startServer() {

  await client.connect();

  console.log("MongoDB Connected");

  const db = client.db(
    "standardarabia"
  );

  const collection =
    db.collection("certificates");

  // =========================
  // HOME
  // =========================
  app.get("/", (req, res) => {
    res.send("Backend Running");
  });

  // =========================
  // GET CERTIFICATES
  // =========================
  app.get(
    "/certificates",
    async (req, res) => {

      const data = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      res.json(data);
    }
  );

  // =========================
  // POST CERTIFICATE
  // =========================
  app.post(
    "/certificates",
    async (req, res) => {

      try {

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

        // duplicate check
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

        // insert
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
          success: false,
          message: err.message,
        });
      }
    }
  );
}

startServer();

// =========================
// EXPORT APP
// =========================
module.exports = app;