const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
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
router.get("/users", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      res.status(404).send("Error fetching users");
      return;
    }
    res.status(200).send(users);
  });
});

router.get("/user/:id", (req, res) => {
  User.findOne({ _id: req.params.id }).then((user) => {
    res.send(user);
  });
});

router.post("/user/signup", uploads.single("image"), async (req, res) => {
  const hashPassword = bcrypt.hashSync(req.body.password, 10);
  const result = await cloudinary.uploader.upload(req.file.path);
  const username = req.body.username.toLowerCase();
  User.findOne({ username }, (err, user) => {
    if (err) return res.status(500).send({ message: "registration  error" });
    if (user) {
      return res
        .status(406)
        .send({ message: "username has already been taken" });
    } else {
      User.create(
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          username: req.body.username,
          image: result.url,
          password: hashPassword,
        },
        (err, user) => {
          if (err) return res.status(409).send({ message: err.message });
          //create token
          const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: 500000,
          });
          const userData = {
            first_name: user.firstName,
            last_name: user.lastName,
            username: user.username,
            user_img: user.image,
            isAdmin: user.isAdmin,
          };
          res.status(201).send({ token: token, userData });
        }
      );
    }
  });
});

router.post("/user/login", (req, res) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) return res.status(500).send({ message: "login error" });
    if (!user) return res.status(404).send({ message: "user not found" });

    const passwordIsValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!passwordIsValid)
      return res.status(403).send({ message: "login invalid" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: 860400, // expires in 24 hours
    });
    const userData = {
      first_name: user.firstName,
      last_name: user.lastName,
      image: user.image,
      isAdmin: user.isAdmin,
    };
    res.json({
      userData,
      message: "Authenticated",
      token: token,
    });
  });
});

router.delete("/user/delete/:id", (req, res) => {
  User.findOneAndRemove(req.params.id, (err) => {
    if (err) return next(err);
    res.send("Deleted successfully!");
  });
});

router.put("/user/update/:id", (req, res, next) => {
  User.findOneAndUpdate(req.params.id, { $set: req.body }, (err, user) => {
    if (err) return next(err);
    res.status(200).send({ user: user.username, message: "Update Successful" });
  });
});

// Getting a single User with the Posts
router.get("/user/:id/posts", (req, res, next) => {
  User.findById({ _id: req.params.id })
    .populate({ path: "posts", model: Post })
    .exec((err, user) => {
      if (err) return res.status(505).send(err);

      res.send(user);
    });
});

// GET /logout
router.get("/logout", function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect("/");
      }
    });
  }
});

module.exports = router;
