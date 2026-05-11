import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

const formatDate = (date) => {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};

export default async function handler(req, res) {
  try {
    await client.connect();

    const db = client.db("standardarabia");
    const collection = db.collection("certificates");

    // ======================
    // GET ALL
    // ======================
    if (req.method === "GET") {
      const data = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(data);
    }

    // ======================
    // POST (INSERT)
    // ======================
    if (req.method === "POST") {
      const { name, iqama, cardNo, expiry, issued, course } = req.body;

      if (!name || !iqama || !cardNo || !expiry || !issued || !course) {
        return res.status(400).json({ message: "All fields required" });
      }

      const exist = await collection.findOne({ cardNo });

      if (exist) {
        return res.status(400).json({ message: "Card already exists" });
      }

      const result = await collection.insertOne({
        name,
        iqama,
        cardNo,
        expiry: formatDate(expiry),
        issued: formatDate(issued),
        course,
        createdAt: new Date(),
      });

      return res.status(201).json({
        success: true,
        insertedId: result.insertedId,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}