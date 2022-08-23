"use strict";

const express = require("express");
const { authenticateUser } = require("./middleware/auth-user");
//construct a router instance
const router = express.Router();
const User = require("./models").User;
const Course = require("./models").Course;

//handler function to wrap each route
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

//first two are get and post:
//Route that returns a list of users
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = await req.currentUser;
    res.json(user).status(200);
  })
);

//Routes that creates a new user
router.post(
  "/users", 
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.status(201).location("/").end();
    } catch (error) {
      console.log("ERROR: ", error.name);

      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        //check above
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// /api/courses GET
router.get(
  "/courses", 
  asyncHandler(async (req, res, next) => {
    const courses = await Course.findAll({
      include: {
        model: User,
      },
    });
    res.json(courses).status(200);
  })
);

// /api/courses/:id GET
router.get(
  "/courses/:id",
  asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id, {
      include: {
        model: User,
      },
    });
    res.json(course).status(200);
  })
);

// /api/courses POST
router.post(
  "/courses", authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const courseId = await Course.create(req.body);
      res.status(201).location(`/courses/${courseId.id}`).end();
    } catch (err) {
      console.log("ERROR:", err.name);
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = err.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw err;
      }
    }
  })
);

// /api/courses/:id PUT -update
router.put(
  "/courses/:id", authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const course = await Course.findByPk(req.params.id);
      if (course) {
        await course.update(req.body);
        res.status(204).location("/").end();
      } else {
        res.status(400);
      }
    } catch (err) {
      console.log("ERROR:", err.name);
      if (
        err.name === "SequelizeValidationError" ||
        err.name === "SequelizeUniqueConstraintError"
      ) {
        //check above
        const errors = err.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw err;
      }
    }
  })
);

// /api/coureses/:id DELETE

router.delete(
  "/courses/:id", authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const course = await Course.findByPk(req.params.id);
      await course.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

module.exports = router;
