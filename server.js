const express = require("express");
const session = require("express-session");

const app = express();
initApp(app);

require("./services/passport")(app);
require("./routes/authRoute")(app);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function initApp(new_app) {
  new_app.set("view engine", "ejs");

  new_app.use(express.urlencoded({ extended: false }));

  new_app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
    })
  );
}
