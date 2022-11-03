const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UploadSchema = new Schema(
  {
    image: {
      type: String,
      trim: true,
    },
    date: { type: Date, default: Date.now },
  },
  { strict: false }
);

const Upload = mongoose.model("Upload", UploadSchema);

module.exports = Upload;
