const { check } = require("express-validator");
const connection = require("../dbcon.js");
const crypto = require("crypto");
const express = require("express");
const moment = require("moment");
const router = express.Router();
const svgCaptcha = require("svg-captcha");

let query = "";
let queryData = [];
let data = {};

router.get("/", (req, res) => {
  res.locals.page = {
    avatar: req.session.studentAvatar,
    flashError: req.flash("flashError"),
    signedOut: !!!req.session.studentId,
    title: "Welcome"
  };

  data = {
    signedOut: !!!req.session.studentId
  };

  res.render("home", data);
});

router.get("/register", (req, res) => {
  // Redirect to student dashboard if there is student logged in.
  if (req.session.studentId) {
    res.redirect("/dashboard");
  } else {
    res.locals.page = {
      signedOut: true,
      title: "Register"
    };

    const challenge = svgCaptcha.create();
    req.session.captcha = challenge.text;

    // Get all avatars.
    connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
      data = {
        avatars: rows,
        minDate: moment().subtract(13, "years"),
        captcha: challenge.data
      };

      res.render("register", data);
    });
  }
});

router.post("/register", [
  check("firstname").trim().escape(),
  check("lastname").trim().escape(),
  check("birthdate").trim().escape(),
  check("username").trim().escape(),
  check("password").trim().escape(),
  check("email").isEmail().normalizeEmail(),
  check("avatar_id").trim().escape(),
  check("optin").trim().escape(),
  check("captcha").trim().escape()
], (req, res) => {
  res.locals.page = {
    signedOut: true,
    title: "Register"
  };

  const {
    firstname,
    lastname,
    birthdate,
    username,
    password,
    email,
    captcha
  } = req.body;

  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
  let challenge;

  let { avatar_id, optin } = req.body;
  // If no avatar is selected, set to null.
  avatar_id = avatar_id || null;
  // If optin is not selected, set to 0.
  optin = optin || 0;

  // Create new student.
  query = `INSERT INTO students (
      firstname,
      lastname,
      birthdate,
      username,
      password,
      email,
      avatar_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  queryData = [
    firstname,
    lastname,
    birthdate,
    username,
    hashedPassword,
    email,
    avatar_id
  ];

  const student = {
    firstname,
    lastname,
    birthdate,
    username,
    password,
    email,
    avatar_id,
    optin
  };

  if (queryData.indexOf("") > -1 || moment().subtract(13, "years").isSameOrBefore(moment(birthdate)) || captcha !== req.session.captcha) {
    avatar_id = avatar_id || "";

    data = {
      minDate: moment().subtract(13, "years"),
      student
    };

    challenge = svgCaptcha.create();
    req.session.captcha = challenge.text;

    if (queryData.indexOf("") > -1) {
      data.alert = "Please fill out all fields.";
    } else if (moment().subtract(13, "years").isSameOrBefore(moment(birthdate))) {
      data.alert = "You must be at least 13 years old to register.";
    } else {
      data.alert = "Challenge code didn't match. Please try again.";
    }

    data.captcha = challenge.data;

    // Get all avatars.
    connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
      data.avatars = rows;
      res.render("register", data);
    });
  } else  {
    connection.pool.query(query, queryData, (error, rows) => {
      if (error) {
        avatar_id = avatar_id || "";

        data = {
          student
        };

        if (error.code === "ER_DUP_ENTRY") {
          challenge = svgCaptcha.create();
          data.alert = "Email or username already exists.";
          data.captcha = challenge.data;
          req.session.captcha = challenge.text;
        }

        // Get all avatars.
        connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
          data.avatars = rows;
          res.render("register", data);
        });
      } else {
        req.session.studentId = rows.insertId;
        req.session.studentName = firstname;

        // Get avatar image.
        connection.pool.query(`SELECT * FROM avatars WHERE id = ?`, [avatar_id], (error, rows) => {
          if (rows.length) {
            req.session.studentAvatar = rows[0].image;
          }

          // Create new optin.
          query = `INSERT INTO optins (confirm, student_id) VALUES (?, ?)`;
          queryData = [optin, req.session.studentId];

          connection.pool.query(query, queryData, (error, rows) => {
            res.redirect("/dashboard");
          });
        });
      }
    });
  }
});

router.get("/login", (req, res) => {
  // Redirect to student dashboard if there is student logged in.
  if (req.session.studentId) {
    if (req.query.r) {
      res.redirect(req.query.r);
    } else {
      res.redirect("/dashboard");
    }
  } else {
    res.locals.page = {
      signedOut: true,
      title: "Login"
    };

    res.render("login", { redirect: req.query.r });
  }
});

router.post("/login", [
  check("username").trim().escape(),
  check("password").trim().escape()
], (req, res) => {
  // Get student by username and password.
  query = `SELECT students.*, (SELECT image FROM avatars WHERE id = students.avatar_id) AS avatar_image
    FROM students
    WHERE students.username = ? AND students.password = ?`;

  const { password, username, redirect } = req.body;
  const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
  queryData = [username, hashedPassword];

  connection.pool.query(query, queryData, (error, rows) => {
    if (error || !rows.length) {
      res.locals.page = {
        signedOut: true,
        title: "Student Login"
      };

      data = {
        alert: "Your username or password is incorrect."
      };
      res.render("login", data);
    } else {
      req.session.studentAvatar = rows[0].avatar_image;
      req.session.studentId = rows[0].id;
      req.session.studentName = rows[0].firstname;

      if (redirect) {
        res.redirect(redirect);
      } else  {
        res.redirect("/dashboard");
      }
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.studentAvatar = null;
  req.session.studentId = null;
  req.session.studentName = null;
  res.redirect("/login");
});

module.exports = router;
