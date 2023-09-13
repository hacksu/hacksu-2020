global.config = require(__dirname + "/../server.config.json");

let express = require("express");

let app = express();
app.set("trust proxy", 1);

// mount to / on port 8000 for reverse proxy
app.use(require("./routes"));
app.use(
  "/api",
  (req, res, next) => {
    req.headers["x-forwarded-for"] =
      req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
    req.ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    next();
  },
  require("./routes/api")
);

app.use(require("./redirects"));

let dist = `${__dirname}/../dist`;
let index = require("path").resolve(`${dist}/index.html`);
let serve = express.static(dist, { extensions: ["html"] });
app.use(serve, (req, res, next) => {
  res.sendFile(index);
});

let port = process.env.PORT || 8000;
app.listen(port, function () {
  console.log("Listening on port", port);
});
