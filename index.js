import { MongoClient } from "mongodb";

// =========================
// MONGODB CLIENT
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
// API HANDLER
// =========================
export default async function handler(
  req,
  res
) {

  // =========================
  // CORS
  // =========================
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://sher-stendararabia-front.vercel.app"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // =========================
  // OPTIONS REQUEST
  // =========================
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    // =========================
    // CONNECT DATABASE
    // =========================
    await client.connect();

    const db = client.db(
      "standardarabia"
    );

    const collection =
      db.collection("certificates");

    // =========================
    // GET ALL CERTIFICATES
    // =========================
    if (req.method === "GET") {

      const data = await collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json({
        success: true,
        data,
      });
    }

    // =========================
    // CREATE CERTIFICATE
    // =========================
    if (req.method === "POST") {

      const {
        name,
        iqama,
        cardNo,
        expiry,
        issued,
        course,
      } = req.body;

      // =========================
      // VALIDATION
      // =========================
      if (
        !name ||
        !iqama ||
        !cardNo ||
        !expiry ||
        !issued ||
        !course
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required",
        });
      }

      // =========================
      // DUPLICATE CHECK
      // =========================
      const exist =
        await collection.findOne({
          cardNo,
        });

      if (exist) {
        return res.status(400).json({
          success: false,
          message:
            "Card number already exists",
        });
      }

      // =========================
      // INSERT DATA
      // =========================
      const result =
        await collection.insertOne({
          name,
          iqama,
          cardNo,
          expiry: formatDate(expiry),
          issued: formatDate(issued),
          course,
          createdAt: new Date(),
        });

      // =========================
      // SUCCESS RESPONSE
      // =========================
      return res.status(201).json({
        success: true,
        message:
          "Certificate saved successfully",
        insertedId:
          result.insertedId,
      });
    }

    // =========================
    // METHOD NOT ALLOWED
    // =========================
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}