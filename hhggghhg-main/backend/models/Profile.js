const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    trim: true,
  },
  avatar_url: {
    type: String,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema);
