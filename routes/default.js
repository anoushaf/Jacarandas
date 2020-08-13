const express = require("express");
const router = express.Router();

router.use((req, res) => {
  res.locals.page = {
    avatar: req.session.studentAvatar,
    signedOut: !!!req.session.studentId,
    title: "Page Not Found"
  };

  res.status(404);
  res.render("error", { code: 404, message: "Oops, we couldn't find that page."});
});

router.use((error, req, res) => {
  res.locals.page = {
    avatar: req.session.studentAvatar,
    signedOut: !!!req.session.studentId,
    title: "Server Error"
  };

  res.status(500);
  res.render("error", { code: 500, message: "Oops, something went wrong."});
});

module.exports = router;
