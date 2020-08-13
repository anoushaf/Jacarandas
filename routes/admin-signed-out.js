const express = require("express");
const router = express.Router();

const ADMIN_PASSWORD = "purple";
const ADMIN_USERNAME = "purple";

router.get("/admin/login", (req, res) => {
  // Redirect to admin if there is admin in session.
  if (req.session.isAdminSignedIn) {
    // Redirect to specific page if there is an r param.
    if (req.query.r) {
      res.redirect(req.query.r);
    } else {
      res.redirect("/admin");
    }
  } else {
    res.locals.page = {
      hideLinks: true,
      signedOut: true,
      title: "Admin: Login"
    };

    res.render("admin/admin-login", { redirect: req.query.r });
  }
});

router.post("/admin/login", (req, res) => {
  const { password, username, redirect } = req.body;

  // Check admin username and password.
  if (password == ADMIN_PASSWORD && username == ADMIN_USERNAME) {
    req.session.isAdminSignedIn = true;

    if (redirect) {
      res.redirect(redirect);
    } else  {
      res.redirect("/admin");
    }
  } else {
    res.locals.page = {
      hideLinks: true,
      signedOut: true,
      title: "Admin: Login"
    };

    data = {
      alert: "Your username or password is incorrect."
    };

    res.render("admin/admin-login", data);
  }
});

router.get("/admin/logout", (req, res) => {
  req.session.isAdminSignedIn = false;
  res.redirect("/admin/login");
});

module.exports = router;
