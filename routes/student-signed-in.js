const { check } = require("express-validator");
const connection = require("../dbcon.js");
const crypto = require("crypto");
const express = require("express");
const moment = require("moment");
const router = express.Router();

let query = "";
let queryData = [];
let data = {};

router.get("/dashboard", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      avatar: req.session.studentAvatar,
      flashError: req.flash("flashError"),
      flashSuccess: req.flash("flashSuccess"),
      title: "My Dashboard"
    };

    // Get enrolled courses for signed in student.
    query = `SELECT courses.* FROM courses
      INNER JOIN course_students ON course_students.course_id = courses.id
      WHERE course_students.student_id = ?
      ORDER BY courses.subject ASC, courses.name ASC`;

    queryData = [req.session.studentId];

    connection.pool.query(query, queryData, (error, rows) => {
      data = {
        courses: rows,
        student: {
          name: req.session.studentName
        }
      };

      res.render("dashboard", data);
    });
  }
});

router.post("/courses/drop", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.body.courseId];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        req.flash("flashError", "Course not found");
        res.redirect("/dashboard");
      } else {
        const course = rows[0];

        // Drop course for logged in student.
        query = `DELETE FROM course_students WHERE course_id = ? AND student_id = ?`;
        queryData = [req.body.courseId, req.session.studentId];

        connection.pool.query(query, queryData, () => {
          req.flash("flashError", `You've dropped ${course.subject}: ${course.name}.`);
          res.redirect("/dashboard");
        });
       }
    });
  }
});

router.post("/courses/enroll", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.body.courseId];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        req.flash("flashError", "Course not found");
        res.redirect("/dashboard");
      } else {
        const course = rows[0];

        // Add course for logged in student.
        query = `INSERT INTO course_students (course_id, student_id) VALUES (?, ?)`;
        queryData = [req.body.courseId, req.session.studentId];

        connection.pool.query(query, queryData, () => {
          req.flash("flashSuccess", `You're enrolled in ${course.subject}: ${course.name}!`);
          res.redirect("/dashboard");
        });
      }
    });
  }
});

router.get("/courses/results", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      avatar: req.session.studentAvatar,
      title: "Courses Search Results"
    };

    // Get all distinct subjects.
    query = `SELECT subject FROM courses GROUP BY subject ORDER BY subject ASC`;

    connection.pool.query(query, [], (error, rows) => {
      data = {
        q: req.query.q,
        subjects: rows
      }

      query = "";
      queryData = [];

      // Add a separate query for each subject to find courses matching search.
      data.subjects.forEach(subject => {
        query += `SELECT * FROM courses
          WHERE (name LIKE ? OR subject LIKE ?) AND subject = ?
          ORDER BY name ASC;`;

        queryData.push(`%${data.q}%`);
        queryData.push(`%${data.q}%`);
        queryData.push(subject.subject);
      });

      connection.pool.query(query, queryData, (error, rows) => {
        data.subjects.forEach((row, index) => {
          if (rows[index].length) {
            row.courses = rows[index];
          }
        });

        // Get enrolled courses for signed in student.
        query = `SELECT courses.id FROM courses
          INNER JOIN course_students ON course_students.course_id = courses.id
          WHERE course_students.student_id = ?
          ORDER BY courses.subject ASC, courses.name ASC`;

        queryData = [req.session.studentId];

        connection.pool.query(query, queryData, (error, rows) => {
          // Create array of enrolled course ids to compare with available courses.
          data.studentCourseIds = rows.map(row => row.id);
          res.render("courses", data);
        });
      });
    });
  }
});

router.get("/courses/:id", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        res.locals.page = {
          avatar: req.session.studentAvatar,
          title: "Page Not Found"
        };

        res.status(404);
        res.render("error", { code: 404, message: "Oops, we couldn't find that page."});
      } else {
        res.locals.page = {
          avatar: req.session.studentAvatar,
          title: `${rows[0].subject}: ${rows[0].name}`
        };

        data = {
          course: rows[0],
          courses: []
        };

        // Get enrolled courses for signed in student.
        query = `SELECT courses.* FROM courses
          INNER JOIN course_students ON course_students.course_id = courses.id
          WHERE course_students.student_id = ?
          ORDER BY courses.subject ASC, courses.name ASC`;

        queryData = [req.session.studentId];

        connection.pool.query(query, queryData, (error, rows) => {
          if (!error) {
            data.courses = rows;
          }

          res.render("course", data);
        });
      }
    });
  }
});

router.get("/courses", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      avatar: req.session.studentAvatar,
      title: "All Courses"
    };

    // Get all distinct subjects.
    query = `SELECT subject FROM courses GROUP BY subject ORDER BY subject ASC`;

    connection.pool.query(query, [], (error, rows) => {
      data = {
        subjects: rows
      }

      query = "";
      queryData = [];

      // Add a separate query for each subject to find courses with subject.
      data.subjects.forEach(subject => {
        query += `SELECT * FROM courses WHERE subject = ? ORDER BY name ASC;`;
        queryData.push(subject.subject);
      });

      connection.pool.query(query, queryData, (error, rows) => {
        data.subjects.forEach((row, index) => {
          row.courses = rows[index];
        });

        // Get enrolled courses for signed in student.
        query = `SELECT courses.id FROM courses
          INNER JOIN course_students ON course_students.course_id = courses.id
          WHERE course_students.student_id = ?
          ORDER BY courses.subject ASC, courses.name ASC`;

        queryData = [req.session.studentId];

        connection.pool.query(query, queryData, (error, rows) => {
          data.studentCourseIds = rows.map(row => row.id);
          res.render("courses", data);
        });
      });
    });
  }
});

router.get("/profile", (req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      avatar: req.session.studentAvatar,
      title: "Edit Profile"
    };

    // Get student by id.
    query = `SELECT * FROM students WHERE id = ?`;
    queryData = [req.session.studentId];

    connection.pool.query(query, queryData, (error, rows) => {
      data = {
        avatars: [],
        minDate: moment().subtract(13, "years"),
        student: rows[0]
      };

      data.student.password = "";

      // Get optin by student_id.
      query = `SELECT * FROM optins WHERE student_id = ?`;
      queryData = [req.session.studentId];

      connection.pool.query(query, queryData, (error, rows) => {
        if (!error) {
          data.student.optin = rows[0].confirm;
        }

        // Get all avatars.
        connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
          data.avatars = rows;
          res.render("profile", data);
        });
      });
    });
  }
});

router.post("/profile", [
  check("firstname").trim().escape(),
  check("lastname").trim().escape(),
  check("birthdate").trim().escape(),
  check("username").trim().escape(),
  check("password").trim().escape(),
  check("email").isEmail().normalizeEmail(),
  check("avatar_id").trim().escape(),
  check("optin").trim().escape()
],(req, res, next) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      avatar: req.session.studentAvatar,
      title: "Edit Profile"
    };

    const {
      firstname,
      lastname,
      birthdate,
      username,
      password,
      email
    } = req.body;

    const hashedPassword = crypto.createHash("md5").update(password).digest("hex");

    let { avatar_id, optin } = req.body;
    // If no avatar is selected, set to null.
    avatar_id = avatar_id || null;
    // If optin is not selected, set to 0.
    optin = optin || 0;

    const fields = [
      "firstname = ?",
      "lastname = ?",
      "birthdate = ?",
      "username = ?",
      "email = ?",
      "avatar_id = ?"
    ];

    queryData = [
      firstname,
      lastname,
      birthdate,
      username,
      email,
      avatar_id
    ];

    // Add password to query only if it's not blank.
    if (password) {
      fields.push("password = ?");
      queryData.push(hashedPassword);
    }

    queryData.push(req.session.studentId);

    // Update student by id.
    query = `UPDATE students SET ${fields.join(", ")} WHERE id = ?`;

    if (queryData.indexOf("") > -1 || moment().subtract(13, "years").isSameOrBefore(moment(birthdate))) {
      avatar_id = avatar_id || "";

      data = {
        minDate: moment().subtract(13, "years"),
        student: {
          firstname,
          lastname,
          birthdate,
          username,
          password,
          email,
          avatar_id,
          optin
        }
      };

      if (queryData.indexOf("") > -1) {
        data.alert = "Please fill out all fields.";
      } else if (moment().subtract(13, "years").isSameOrBefore(moment(birthdate))) {
        data.alert = "You must be at least 13 years old to register.";
      }

      // Get all avatars.
      connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
        data.avatars = rows;
        res.render("profile", data);
      });
    } else {
      connection.pool.query(query, queryData, (error, rows) => {
        if (error) {
          avatar_id = avatar_id || "";

          data = {
            avatars: [],
            student: {
              firstname,
              lastname,
              birthdate,
              username,
              password,
              email,
              avatar_id,
              optin
            }
          };

          if (error.code === "ER_DUP_ENTRY") {
            data.alert = "Changes not saved. Email or username already exists on another account.";
          } else {
            data.alert = `${error.code}: ${error.sqlMessage}`;
          }

          // Get all avatars.
          connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
            data.avatars = rows;
            res.render("profile", data);
          });
        } else {
          // Update optin for student.
          query = `UPDATE optins SET confirm = ? WHERE student_id = ?`;
          queryData = [optin, req.session.studentId];

          connection.pool.query(query, queryData, (error, rows) => {
            req.session.studentName = firstname;

            if (avatar_id) {
              // Get avatar by id.
              query = `SELECT * FROM avatars WHERE id = ?`;
              queryData = [avatar_id];

              connection.pool.query(query, queryData, (error, rows) => {
                req.session.studentAvatar = rows[0].image;
                req.flash("flashSuccess", "Profile updated.");
                res.redirect("/dashboard");
              });
            } else {
              req.flash("flashSuccess", "Profile updated.");
              res.redirect("/dashboard");
            }
          });
        }
      });
    }
  }
});

router.post("/delete-account", (req, res) => {
  // Redirect to student login if there is no student logged in.
  if (!req.session.studentId) {
    res.redirect(`/login?r=${req.originalUrl}`);
  } else {
    // Get user by id.
    query = `SELECT * FROM students WHERE id = ?`;
    queryData = [req.session.studentId];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        req.flash("flashError", "Unable to complete request.");
        res.redirect("/dashboard");
      } else {
        const student = rows[0];

        // Delete avatar by id.
        query = `DELETE FROM students WHERE id = ?`;
        queryData = [req.session.studentId];

        connection.pool.query(query, queryData, () => {
          req.session.studentId = null;
          req.flash("flashError", `${student.username} account deleted.`);
          res.redirect("/");
        });
      }
    });
  }
});

module.exports = router;
