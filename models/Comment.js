const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  date: { type: Date, default: Date.now },
});

const Comment = mongoose.model("comment", CommentSchema);

module.exports = Comment;
