// Dependencies
// Express.js connection
const router = require("express").Router();
// User, Post, Vote models
const { User, Post, Comment } = require("../../models");
// Express Session for the session data
const session = require("express-session");
// Authorization Helper
const withAuth = require("../../utils/auth");
// Sequelize store to save the session so the user can remain logged in

// Routes

// GET /api/users -- get all users
router.get("/", (req, res) => {
  User.findAll({
    attributes: { exclude: ["password"] },
  })
    // return the data as JSON formatted
    .then((dbUserData) => res.json(dbUserData))
    // if there is a server error, return that error
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET /api/users/1 -- get a single user by id
router.get("/:id", (req, res) => {
  User.findOne({
    attributes: { exclude: ["password"] },
    where: {
      id: req.params.id,
    },

    include: [
      {
        model: Post,
        attributes: ["id", "title", "post_text", "created_at"],
      },
      {
        model: Comment,
        attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
        include: {
          model: Post,
          attributes: ["title"],
        },
      },
    ],
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        // if no user is found, return an error
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      // otherwise, return the data for the requested user
      res.json(dbUserData);
    })
    .catch((err) => {
      // if there is a server error, return that error
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/users -- add a new user
router.post("/", (req, res) => {
  // create method
  // expects an object in the form {username: 'Lernantino', email: 'lernantino@gmail.com', password: 'password1234'}
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  })
    // send the user data back to the client as confirmation and save the session
    .then((dbUserData) => {
      req.session.save(() => {
        req.session.user_id = dbUserData.id;
        req.session.username = dbUserData.username;
        req.session.loggedIn = true;

        res.json(dbUserData);
      });
    })
    // if there is a server error, return that error
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// POST /api/users/login -- login route for a user
router.post("/login", (req, res) => {
  User.findOne({
    where: {
      email: req.body.email,
    },
  }).then((dbUserData) => {
    if (!dbUserData) {
      res.status(400).json({ message: "No user with that email address!" });
      return;
    }

    const validPassword = dbUserData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password!" });
      return;
    }

    req.session.save(() => {
      req.session.user_id = dbUserData.id;
      req.session.username = dbUserData.username;
      req.session.loggedIn = true;

      res.json({ user: dbUserData, message: "You are now logged in!" });
    });
  });
});

// POST /api/users/logout -- log out an existing user
router.post("/logout", withAuth, (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

// PUT /api/users/1 -- update an existing user
router.put("/:id", withAuth, (req, res) => {
  User.update(req.body, {
    individualHooks: true,

    where: {
      id: req.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData[0]) {
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// DELETE /api/users/1 -- delete an existing user
router.delete("/:id", withAuth, (req, res) => {
  User.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((dbUserData) => {
      if (!dbUserData) {
        res.status(404).json({ message: "No user found with this id" });
        return;
      }
      res.json(dbUserData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
