const exp = require("express");
const bloodApp = exp.Router();
bloodApp.use(exp.json());
const { ObjectId } = require("mongodb");
const expressAsyncHandler = require("express-async-handler");
const tokenVerify = require("../middlewares/tokenVerify");

// ✅ Get blood stock for a specific blood bank by bloodBankId
bloodApp.get(
  "/bloodStock/byBloodBank/:bloodBankId",
  expressAsyncHandler(async (req, res) => {
    const bloodCollection = req.app.get("bloodCollection");
    const bloodBankId = req.params.bloodBankId;
    

    try {
      // Find the blood stock by bloodBankId
      const bloodStock = await bloodCollection.findOne({ bloodBankId: bloodBankId });

      // If no blood stock found
      if (!bloodStock) {
        res.send({ message: "No blood stock found for this blood bank" });
      } else {
        res.send({
          message: "Blood stock fetched successfully",
          data: {
            bloodBankId: bloodStock.bloodBankId,
            stock: bloodStock.stock,
          },
        });
      }
    } catch (error) {
      res.send({
        message: "Error fetching blood stock",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Get all blood stock
bloodApp.get(
  "/bloodStock",
  expressAsyncHandler(async (req, res) => {
    const bloodCollection = req.app.get("bloodCollection");

    try {
      const bloodStock = await bloodCollection.find().toArray();
      res.send({
        message: "All blood stock fetched successfully",
        data: bloodStock,
      });
    } catch (error) {
      res.send({
        message: "Error fetching blood stock",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Add new blood stock
bloodApp.post(
  "/bloodStock",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const bloodCollection = req.app.get("bloodCollection");
    const newStock = req.body;

    try {
      // Insert new blood stock with bloodBankId
      const result = await bloodCollection.insertOne({
        bloodBankId: newStock.bloodBankId, // Ensure bloodBankId is stored
        stock: newStock.stock,
      });

      res.send({
        message: "New blood stock added successfully",
        data: result.ops
          ? result.ops[0]
          : { _id: result.insertedId, bloodBankId: newStock.bloodBankId, stock: newStock.stock },
      });
    } catch (error) {
      res.send({
        message: "Error adding blood stock",
        errorMessage: error.message,
      });
    }
  })
);

// ✅ Update blood stock by stock ID
bloodApp.put(
  "/bloodStock/:stockId",
  tokenVerify,
  expressAsyncHandler(async (req, res) => {
    const bloodCollection = req.app.get("bloodCollection");
    const stockId = req.params.stockId;
    const modifiedStock = req.body;

    try {
      const result = await bloodCollection.updateOne(
        { _id: new ObjectId(stockId) }, // Update by MongoDB's _id
        { $set: { ...modifiedStock } }
      );

      if (result.modifiedCount === 0) {
        res.send({ message: "No changes made to the blood stock" });
      } else {
        res.send({ message: "Blood stock updated successfully" });
      }
    } catch (error) {
      res.send({
        message: "Error updating blood stock",
        errorMessage: error.message,
      });
    }
  })
);

module.exports = bloodApp;
