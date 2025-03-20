const exp = require("express");
const campApp = exp.Router();
campApp.use(exp.json());
const { ObjectId } = require("mongodb");
const expressAsyncHandler = require("express-async-handler");
const tokenVerify = require("../middlewares/tokenVerify");

// ✅ Get all campaigns
campApp.get(
  "/campaigns",
  expressAsyncHandler(async (req, res) => {
    const campCollection = req.app.get("campCollection");

    try {
      const campaigns = await campCollection.find().toArray();
      res.send({ message: "All campaigns fetched successfully", data: campaigns });
    } catch (error) {
      res.send({ message: "Error fetching campaigns", errorMessage: error.message });
    }
  })
);

// ✅ Delete a campaign by ID
campApp.delete(
  "/campaigns/:deleteId",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const campCollection = req.app.get("campCollection");
    const deleteId = req.params.deleteId;

    try {
      const result = await campCollection.deleteOne({ _id: new ObjectId(deleteId) });

      if (result.deletedCount === 0) {
        res.send({ message: "No campaign found with the given ID" });
      } else {
        res.send({ message: "Campaign deleted successfully" });
      }
    } catch (error) {
      res.send({ message: "Error deleting campaign", errorMessage: error.message });
    }
  })
);

// ✅ Get a single campaign by ID
campApp.get(
  "/campaigns/:campaignId",
  expressAsyncHandler(async (req, res) => {
    const campCollection = req.app.get("campCollection");
    const campaignId = req.params.campaignId;

    try {
      const campaign = await campCollection.findOne({ _id: new ObjectId(campaignId) });

      if (!campaign) {
        res.send({ message: "No campaign found with the given ID" });
      } else {
        res.send({ message: "Campaign fetched successfully", data: campaign });
      }
    } catch (error) {
      res.send({ message: "Error fetching campaign", errorMessage: error.message });
    }
  })
);

// ✅ Add a new campaign
campApp.post(
  "/campaigns",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const campCollection = req.app.get("campCollection");
    const newCampaign = req.body;

    try {
      await campCollection.insertOne(newCampaign);
      res.send({ message: "New campaign added successfully" });
    } catch (error) {
      res.send({ message: "Error adding campaign", errorMessage: error.message });
    }
  })
);

// ✅ Update a campaign by ID
campApp.put(
  "/campaigns/:campaignId",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const campCollection = req.app.get("campCollection");
    const campaignId = req.params.campaignId;
    const modifiedCampaign = req.body;

    try {
      const result = await campCollection.updateOne(
        { _id: new ObjectId(campaignId) },
        { $set: { ...modifiedCampaign } }
      );

      if (result.modifiedCount === 0) {
        res.send({ message: "No changes made to the campaign" });
      } else {
        res.send({ message: "Campaign updated successfully" });
      }
    } catch (error) {
      res.send({ message: "Error updating campaign", errorMessage: error.message });
    }
  })
);

module.exports = campApp;
