const bodyParser = require("body-parser");
const express = require("express");
const flash = require('connect-flash');
const handlebars = require("express-handlebars");
const path = require("path");
const session = require("express-session");
const app = express();

const hbs = handlebars.create({ helpers: require("./handlebars-helpers") });

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("port", process.argv[2] || 3000);

// Session
app.use(session({
  name: "jacarandas",
  resave: true,
  saveUninitialized: true,
  secret: "da12<%#3dgnmbn"
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "static")))
app.use(flash());

// Routes
app.use(require("./routes/admin-signed-out"));
app.use(require("./routes/admin-signed-in"));
app.use(require("./routes/student-signed-out"));
app.use(require("./routes/student-signed-in"));
app.use(require("./routes/default"));

app.listen(app.get("port"), () => {
  console.log(`App running at http://localhost:${app.get("port")}; press Ctrl-C to terminate.`);
});
