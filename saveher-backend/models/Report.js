const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    area: { type: String, required: true, lowercase: true, trim: true },
    text: { type: String, required: true, trim: true },
    time: { type: String },
    status: { type: String, default: "pending", enum: ["pending", "reviewed", "resolved"] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);