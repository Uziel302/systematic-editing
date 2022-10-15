const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const indexRouter = require("./router.js");
const authRouter = require("./auth.js");
const port = parseInt(process.env.PORT, 10); 

app.use(
  require("express-session")({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/auth", authRouter);
app.use("/api", indexRouter);

app.use(express.static('angular'));

app.listen(port, () => console.log("Server is running on port "+port));
