const mongoose = require("mongoose");

const TaxCalculationSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.ObjectId,
    ref: "Property",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  fiscal_year: {
    type: String,
    required: [true, "Please add a fiscal year"],
  },
  base_tax: {
    type: Number,
    required: [true, "Please add base tax"],
  },
  location_factor: {
    type: Number,
    default: 1.0,
  },
  property_type_factor: {
    type: Number,
    default: 1.0,
  },
  age_depreciation: {
    type: Number,
    default: 0,
  },
  total_tax: {
    type: Number,
    required: [true, "Please add total tax"],
  },
  ai_reasoning: {
    type: String,
  },
  calculated_at: {
    type: Date,
    default: Date.now,
  },
  payment_status: {
    type: String,
    default: "pending",
  },
  paid_at: {
    type: Date,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model("TaxCalculation", TaxCalculationSchema);
