const express = require("express");
const {
  getTaxCalculations,
  getTaxCalculation,
  createTaxCalculation,
  updateTaxCalculation,
  deleteTaxCalculation,
} = require("../controllers/taxCalculationController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router
  .route("/")
  .get(protect, getTaxCalculations)
  .post(protect, createTaxCalculation);

router
  .route("/:id")
  .get(protect, getTaxCalculation)
  .put(protect, updateTaxCalculation)
  .delete(protect, deleteTaxCalculation);

module.exports = router;
