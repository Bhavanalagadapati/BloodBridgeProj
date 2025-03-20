const exp = require("express");
const managerApp = exp.Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const expressAsyncHandler = require("express-async-handler");
require("dotenv").config();

managerApp.use(exp.json());

// ✅ Add a new blood bank registration
managerApp.post(
  "/bbRegistrations",
  expressAsyncHandler(async (req, res) => {
    const managerCollection = req.app.get("managerCollection");
    const bloodStockCollection = req.app.get("bloodStockCollection"); // ✅ Get bloodStock collection
    const newBloodBank = req.body;
    
    if (!bloodStockCollection) {
      console.error("❗️ Blood stock collection not found!");
      return res.status(500).send({ message: "Blood stock collection not found!" });
    }

    try {
      // Check if email already exists
      const existingBank = await managerCollection.findOne({
        email: newBloodBank.email,
      });

      if (existingBank) {
        return res.status(400).send({ message: "Email already registered" });
      }

      // ✅ Hash the password before inserting
      const hashedPassword = await bcryptjs.hash(newBloodBank.password, 10);
      newBloodBank.password = hashedPassword;

      // ✅ Insert blood bank data
      const result = await managerCollection.insertOne(newBloodBank);


      // ✅ Send success response
      res.send({
        message: "Blood bank registered successfully",
        registrationId: result.insertedId,
      });
    } catch (error) {
      res.status(500).send({
        message: "Error registering blood bank",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Blood bank login route
managerApp.post(
  "/bbLogin",
  expressAsyncHandler(async (req, res) => {
    const managerCollection = req.app.get("managerCollection");
    const { email, password } = req.body;

    // Check if the email exists
    const user = await managerCollection.findOne({ email });

    // If no user is found
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    // ✅ Send response after successful login (without token)
    res.send({
      message: "Login successful",
      user, // Send user details if needed
    });
  })
);

// ✅ Get all blood bank registrations
managerApp.get(
  "/bbRegistrations",
  expressAsyncHandler(async (req, res) => {
    const managerCollection = req.app.get("managerCollection");

    try {
      const allRegistrations = await managerCollection.find().toArray();
      res.send({
        message: "All blood bank registrations fetched successfully",
        data: allRegistrations,
      });
    } catch (error) {
      res.status(500).send({
        message: "Error fetching blood bank registrations",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Update blood bank details by ID
const { ObjectId } = require("mongodb"); // Make sure to import ObjectId

managerApp.put(
  "/bbRegistrations/:id",
  expressAsyncHandler(async (req, res) => {
    const managerCollection = req.app.get("managerCollection");
    const bloodBankId = req.params.id;
    const updatedDetails = req.body;

    try {
      const result = await managerCollection.updateOne(
        { _id: new ObjectId(bloodBankId) },
        { $set: { ...updatedDetails } }
      );

      if (result.modifiedCount === 0) {
        res.send({ message: "No changes made to the blood bank profile" });
      } else {
        res.send({ message: "Blood bank profile updated successfully" });
      }
    } catch (error) {
      res.status(500).send({
        message: "Error updating blood bank profile",
        errorMessage: error.message,
      });
    }
  })
);

module.exports = managerApp;
