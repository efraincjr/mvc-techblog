// Dependencies
// Express.js connection
const router = require("express").Router();
// User Model, Post Model, and Comment Model
const { User, Post, Comment } = require("../../models");
// Sequelize database connection
const sequelize = require("../../config/connection");
// Authorization Helper
const withAuth = require("../../utils/auth");

// Routes

// GET api/posts/ -- get all posts
router.get("/", (req, res) => {
  Post.findAll({
    attributes: ["id", "post_text", "title", "created_at"],
    // Order the posts from most recent to least
    order: [["created_at", "DESC"]],

    include: [
      {
        model: User,
        attributes: ["username"],
      },
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    // return the posts
    .then((dbPostData) => res.json(dbPostData))
    // if there was a server error, return the error
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET api/posts/:id -- get a single post by id
router.get("/:id", (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },

    attributes: ["id", "post_text", "title", "created_at"],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    .then((dbPostData) => {
      // if no post by that id exists, return an error
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      // if a server error occured, return an error
      console.log(err);
      res.status(500).json(err);
    });
});

// POST api/posts -- create a new post
router.post("/", withAuth, (req, res) => {
  Post.create({
    title: req.body.title,
    post_text: req.body.post_text,
    user_id: req.session.user_id,
  })
    .then((dbPostData) => res.json(dbPostData))
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// PUT api/posts/1-- update a post's title or text
router.put("/:id", withAuth, (req, res) => {
  Post.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// DELETE api/posts/1 -- delete a post
router.delete("/:id", withAuth, (req, res) => {
  Post.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: "No post found with this id" });
        return;
      }
      res.json(dbPostData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
