const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    author: {
      type: String,
      required: [true, "author is required"],
      trim: true,
    },
    title: {
      type: String,
      required: [true, "enter post title please"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "enter post field"],
    },
    video_link: {
      type: String,
    },
    image: {
      type: String,
      required: [true],
      trim: true,
    },
    likes_count: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    category: {
      type: String,
      required: [true, "select category"],
    },

    date: { type: Date, default: Date.now },
  },
  { strict: false }
);

const Post = mongoose.model("Post", PostSchema);

Post.aggregate([{ $count: "comments" }]);

module.exports = Post;
