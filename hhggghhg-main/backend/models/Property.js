const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  property_name: {
    type: String,
    required: [true, "Please add a property name"],
    trim: true,
  },
  property_type: {
    type: String,
    enum: ["residential", "commercial", "industrial", "agricultural", "mixed_use"],
    default: "residential",
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  city: {
    type: String,
    default: "Jaipur",
  },
  state: {
    type: String,
    default: "Rajasthan",
  },
  pincode: {
    type: String,
    required: [true, "Please add a pincode"],
  },
  area_sqft: {
    type: Number,
    required: [true, "Please add area in sqft"],
  },
  built_up_area_sqft: {
    type: Number,
  },
  floor_count: {
    type: Number,
    default: 1,
  },
  construction_year: {
    type: Number,
  },
  property_value: {
    type: Number,
    required: [true, "Please add property value"],
  },
  status: {
    type: String,
    enum: ["active", "pending", "disputed", "exempt"],
    default: "active",
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model("Property", PropertySchema);
