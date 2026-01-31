const express = require("express");
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.route("/").get(protect, getProperties).post(protect, createProperty);

router
  .route("/:id")
  .get(protect, getProperty)
  .put(protect, updateProperty)
  .delete(protect, deleteProperty);

module.exports = router;
