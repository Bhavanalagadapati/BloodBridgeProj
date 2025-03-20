const exp = require("express");
const donorApp = exp.Router();
donorApp.use(exp.json());
const { ObjectId } = require("mongodb");
const expressAsyncHandler = require("express-async-handler");
const tokenVerify = require("../middlewares/tokenVerify");

// ✅ Add a new donor
donorApp.post(
  "/donors",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const donorCollection = req.app.get("donorCollection");
    const newDonor = req.body;

    try {
      const result = await donorCollection.insertOne(newDonor);
      res.send({
        message: "New donor registered successfully",
        donorId: result.insertedId,
      });
    } catch (error) {
      res.send({
        message: "Error adding donor",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Get all donors
donorApp.get(
  "/donors",
  expressAsyncHandler(async (req, res) => {
    const donorCollection = req.app.get("donorCollection");

    try {
      const allDonors = await donorCollection.find().toArray();
      res.send({
        message: "All donors fetched successfully",
        data: allDonors,
      });
    } catch (error) {
      res.send({
        message: "Error fetching donors",
        errorMessage: error.message,
      });
    }
  })
);

module.exports = donorApp;
