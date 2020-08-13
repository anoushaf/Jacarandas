const { check } = require("express-validator");
const connection = require("../dbcon.js");
const express = require("express");
const fs = require("fs");
const router = express.Router();

let query = "";
let queryData = [];
let data = {};

router.get("/admin", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Welcome"
    };
    res.render("admin/admin-dashboard");
  }
});

router.get("/admin/courses/new", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Add New Course"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/courses");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const mp3s = files.filter(file => file.match(/mp3/)).map(mp3 => {
      return { mp3 };
    });

    res.render("admin/admin-course-new", { images, mp3s });
  }
});

router.post("/admin/courses/new", [
  check("name").trim().escape(),
  check("subject").trim().escape(),
  check("description").trim(),
  check("question").trim(),
  check("answer").trim(),
  check("audio").trim().escape(),
  check("image").trim().escape(),
  check("video").trim()
], (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Add New Course"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/courses");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const mp3s = files.filter(file => file.match(/mp3/)).map(mp3 => {
      return { mp3 };
    });

    const {
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
    } = req.body;

    // Create new course.
    query = `INSERT INTO courses (
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    queryData = [
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
    ];

    const course = {
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
    };

    if (!name) {
      data = {
        course,
        alert: "Please fill out name.",
        images,
        mp3s
      };

      res.render("admin/admin-course-new", data);
    } else {
      connection.pool.query(query, queryData, (error, rows) => {
        if (error) {
          data = {
            course,
            images,
            mp3s
          };

          if (error.code === "ER_DUP_ENTRY") {
            data.alert = "Course already exists.";
          } else {
            data.alert = "There was an error while saving.";
          }

          res.render("admin/admin-course-new", data);
        } else {
          req.flash("flashSuccess", `${subject}: ${name} added.`);
          res.redirect("/admin/courses");
        }
      });
    }
  }
});

router.get("/admin/courses/:id/preview", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Preview Course"
    };

    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        res.locals.page = {
          admin: true,
          title: "Page Not Found"
        };

        res.status(404);
        res.render("error", { code: 404, message: "Oops, we couldn't find that page."});
      } else {
        data = {
          course: rows[0]
        };
        res.render("admin/admin-course-preview", data);
      }
    });
  }
});

router.get("/admin/courses/:id/edit", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Edit Course"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/courses");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const mp3s = files.filter(file => file.match(/mp3/)).map(mp3 => {
      return { mp3 };
    });

    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        res.locals.page = {
          admin: true,
          title: "Page Not Found"
        };

        res.status(404);
        res.render("error", { code: 404, message: "Oops, we couldn't find that page."});
      } else {
        data = {
          action: `/admin/courses/${rows[0].id}/edit`,
          course: rows[0],
          images,
          mp3s
        };
        res.render("admin/admin-course-edit", data);
      }
    });
  }
});

router.post("/admin/courses/:id/edit", [
  check("name").trim().escape(),
  check("subject").trim().escape(),
  check("description").trim(),
  check("question").trim(),
  check("answer").trim(),
  check("audio").trim().escape(),
  check("image").trim().escape(),
  check("video").trim()
],
(req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Edit Course"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/courses");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const mp3s = files.filter(file => file.match(/mp3/)).map(mp3 => {
      return { mp3 };
    });

    const {
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
    } = req.body;

    // Update course.
    query = `UPDATE courses SET
      name = ?,
      subject = ?,
      description = ?,
      question = ?,
      answer = ?,
      audio = ?,
      image = ?,
      video = ?
      WHERE id = ?`;

    queryData = [
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video,
      req.params.id
    ];

    const course = {
      name,
      subject,
      description,
      question,
      answer,
      audio,
      image,
      video
    };

    if (!name) {
      data = {
        course,
        alert: "Please fill out name.",
        images,
        mp3s
      };

      res.render("admin/admin-course-edit", data);
    } else {
      connection.pool.query(query, queryData, (error, rows) => {
        if (error) {
          data = {
            course,
            images,
            mp3s
          };

          if (error.code === "ER_DUP_ENTRY") {
            data.alert = "Course already exists.";
          } else {
            data.alert = "There was an error while saving.";
          }

          res.render("admin/admin-course-edit", data);
        } else {
          req.flash("flashSuccess", `${subject}: ${name} updated.`);
          res.redirect("/admin/courses");
        }
      });
    }
  }
});

router.post("/admin/courses/:id/delete", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    // Get course by id.
    query = `SELECT * FROM courses WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        req.flash("flashError", "Course not found");
        res.redirect("/admin/courses");
      } else {
        const course = rows[0];
        // Delete course by id.
        query = `DELETE FROM courses WHERE id = ?`;
        queryData = [req.params.id];

        connection.pool.query(query, queryData, () => {
          req.flash("flashError", `${course.subject}: ${course.name} deleted.`);
          res.redirect("/admin/courses");
        });
      }
    });
  }
});

router.get("/admin/courses", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      flashError: req.flash("flashError"),
      flashSuccess: req.flash("flashSuccess"),
      title: "Admin: Courses"
    };

    // Get all courses.
    query = `SELECT * FROM courses ORDER BY subject ASC, name ASC`;

    connection.pool.query(query, [], (error, rows) => {
      data = {
        courses: rows
      };

      res.render("admin/admin-courses", data);
    });
  }
});

router.get("/admin/avatars/new", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    // Get files in static folder.
    const files = fs.readdirSync("./static/images/avatars");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });

    res.locals.page = {
      admin: true,
      title: "Admin: Add New Avatar"
    };
    res.render("admin/admin-avatar-new", { images });
  }
});

router.post("/admin/avatars/new", [
  check("image").trim().escape()
], (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Add New Avatar"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/avatars");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const { image } = req.body;

    // Create new avatar.
    query = `INSERT INTO avatars (image) VALUES (?)`;
    queryData = [req.body.image];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error) {
        data = {
          avatar: {
            image
          },
          alert: "Avatar already exists.",
          images
        };
        res.render("admin/admin-avatar-new", data);
      } else {
        req.flash("flashSuccess", `${image} added.`);
        res.redirect("/admin/avatars");
      }
    });
  }
});

router.get("/admin/avatars/:id/edit", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    // Get files in static folder.
    const files = fs.readdirSync("./static/images/avatars");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });

    res.locals.page = {
      admin: true,
      title: "Admin: Edit Avatar"
    };

    // Get all avatars.
    query = `SELECT * FROM avatars WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        res.locals.page = {
          admin: true,
          title: "Page Not Found"
        };

        res.status(404);
        res.render("error", { code: 404, message: "Oops, we couldn't find that page."});
      } else {
        data = {
          action: `/admin/avatars/${rows[0].id}/edit`,
          avatar: rows[0],
          images
        };
        res.render("admin/admin-avatar-edit", data);
      }
    });
  }
});

router.post("/admin/avatars/:id/edit", [
  check("image").trim().escape()
], (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Edit Avatar"
    };

    // Get files in static folder.
    const files = fs.readdirSync("./static/images/avatars");
    const images = files.filter(file => file.match(/(gif|jpg|png)/)).map(image => {
      return { image };
    });
    const { image } = req.body;

    // Update avatar.
    query = `UPDATE avatars SET image = ? WHERE id = ?`;
    queryData = [req.body.image, req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error) {
        data = {
          avatar: {
            image
          },
          alert: "Avatar already exists.",
          images
        };
        res.render("admin/admin-avatar-edit", data);
      } else {
        req.flash("flashSuccess", `${image} updated.`);
        res.redirect("/admin/avatars");
      }
    });
  }
});

router.post("/admin/avatars/:id/delete", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    // Get avatar by id.
    query = `SELECT * FROM avatars WHERE id = ?`;
    queryData = [req.params.id];

    connection.pool.query(query, queryData, (error, rows) => {
      if (error || !rows.length) {
        req.flash("flashError", "Avatar not found");
        res.redirect("/admin/avatars");
      } else {
        const avatar = rows[0];

        // Delete avatar by id.
        query = `DELETE FROM avatars WHERE id = ?`;
        queryData = [req.params.id];

        connection.pool.query(query, queryData, () => {
          req.flash("flashError", `${avatar.image} deleted.`);
          res.redirect("/admin/avatars");
        });
      }
    });
  }
});

router.get("/admin/avatars", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      flashError: req.flash("flashError"),
      flashSuccess: req.flash("flashSuccess"),
      title: "Admin: Avatars"
    };

    // Get all avatars.
    connection.pool.query(`SELECT * FROM avatars`, [], (error, rows) => {
      data = {
        avatars: rows
      };

      res.render("admin/admin-avatars", data);
    });
  }
});

router.get("/admin/students", (req, res) => {
  // Redirect to admin login if there is no admin logged in.
  if (!req.session.isAdminSignedIn) {
    res.redirect(`/admin/login?r=${req.originalUrl}`);
  } else {
    res.locals.page = {
      admin: true,
      title: "Admin: Students"
    };

    // Get all students and optins.
    query = `SELECT CONCAT(students.firstname, ' ', students.lastname) AS fullname,
      students.email,
      students.username,
      (SELECT image FROM avatars WHERE id = students.avatar_id) AS avatar,
      optins.confirm AS optin
      FROM students
      INNER JOIN optins ON optins.student_id = students.id
      ORDER BY lastname ASC, firstname ASC`

    connection.pool.query(query, [], (error, rows) => {
      data = {
        students: rows
      };

      res.render("admin/admin-students", data);
    });
  }
});

module.exports = router;
