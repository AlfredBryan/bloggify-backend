const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary");
require("dotenv").config();

const router = express.Router();

const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Upload = require("../models/Uploads");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("invalid image file!", false);
  }
};
const uploads = multer({ storage, fileFilter });

// Getting All Post
router.get("/posts", (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) {
      res.status(404).send("Error fetching posts");
      return;
    }
    res.status(200).send(posts);
  });
});

router.post("/upload", uploads.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    Upload.create(
      {
        image: result.url,
      },
      (err, upload) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.status(200).send(upload);
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

// Adding a New Post
router.post("/post/create", uploads.single("image"), async (req, res) => {
  const { author, title, content, video_link, category } = req.body;
  const result = await cloudinary.uploader.upload(req.file.path);
  Post.create(
    {
      author,
      title,
      content,
      category,
      image: result.url,
      video_link,
    },
    (err, post) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send(post);
    }
  );
});

// Getting a single Post with it's Comment
router.get("/post/:id", (req, res, next) => {
  Post.findById({ _id: req.params.id })
    .populate({ path: "comments", model: Comment })
    .exec((err, post) => {
      if (err) return res.status(505).send(err);

      res.send(post);
    });
});

// Adding A New Comment to A single Post
router.post("/post/:id/comment", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    let comment = new Comment({
      name: req.body.name,
      comment: req.body.comment,
    });
    post.comments.push(comment);
    comment.save((error) => {
      if (error) return res.send(error);
    });
    post.save((error, post) => {
      if (error) return res.send(error);
      res.send(post);
    });
  });
});

// Adding or Removing A Like to A single Post
router.post("/post/:id/like", (req, res) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    if (req.body.like_type == "increment") {
      post.likes_count += 1;
    }
    if (req.body.like_type == "decrement") {
      post.likes_count -= 1;
    }
    post.save((error, post) => {
      if (error) return res.send(error);
      res.send(post);
    });
  });
});

// Getting a  Post
router.get("/post/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    res.send(post);
  });
});

//Deleting a post
router.delete("/post/delete/:id", (req, res) => {
  Post.findOneAndRemove(req.params.id, (err) => {
    if (err) return next(err);
    res.send("Deleted successfully!");
  });
});

router.get("/comment/:id", (req, res) => {
  Comment.findOne({ _id: req.params.id }).then((comment) => {
    res.send(comment.info.count());
  });
});

router.get("/amount/:id", (req, res, next) => {
  Post.findById({ _id: req.params.id })
    .populate({ path: "comments", model: Comment })
    .exec((err, post) => {
      if (err) return res.status(505).send(err);

      res.send(post);
    });
});
module.exports = router;
