const exp = require("express");
const userCampApp = exp.Router();
userCampApp.use(exp.json());
const { ObjectId } = require("mongodb");
const expressAsyncHandler = require("express-async-handler");
const tokenVerify = require("../middlewares/tokenVerify");

// ✅ Add a new camp registration
userCampApp.post(
  "/campRegisters",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const userCampCollection = req.app.get("userCampCollection");
    const newRegistration = req.body;

    try {
      const result = await userCampCollection.insertOne(newRegistration);
      res.send({
        message: "User registered for the campaign successfully",
        registrationId: result.insertedId,
      });
    } catch (error) {
      res.send({
        message: "Error registering user for the campaign",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Get all camp registrations
userCampApp.get(
  "/campRegisters",
  expressAsyncHandler(async (req, res) => {
    const userCampCollection = req.app.get("userCampCollection");

    try {
      const allRegistrations = await userCampCollection.find().toArray();
      res.send({
        message: "All campaign registrations fetched successfully",
        data: allRegistrations,
      });
    } catch (error) {
      res.send({
        message: "Error fetching campaign registrations",
        errorMessage: error.message,
      });
    }
  })
);

module.exports = userCampApp;
