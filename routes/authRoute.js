const passport = require("passport");
const { pool } = require("../config/dbConfig");
const bcrypt = require("bcrypt");
const SETTINGS = require("../config/Settings");

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

module.exports = (app) => {
  app.get("/", (req, res) => {
    res.render("index");
  });

  app.get("/users/register", checkAuthenticated, (req, res) => {
    res.render("register");
  });

  app.get("/users/login", checkAuthenticated, (req, res) => {
    res.render("login");
  });

  app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
    res.render("dashboard", { user: req.user.nombre_completo });
  });

  app.get("/users/logout", (req, res) => {
    req.logOut();
    req.flash("success_msg", "Cerraste tu sesión");
    res.redirect("/users/login");
  });

  app.post("/users/register", async (req, res) => {
    let { name, email, password, password2 } = req.body;

    let errors = [];

    if (!name || !email || !password || !password2) {
      errors.push({ message: "Ingresa todos los campos." });
    }

    if (password.length < SETTINGS.minPasswordLength) {
      errors.push({
        message: "La contaseña no debe tener menos de 6 caracteres.",
      });
    }

    if (password != password2) {
      errors.push({ message: "Las contraseñas no coinciden." });
    }

    if (errors.length > 0) {
      res.render("register", { errors });
    } else {
      // Form validation has passed
      let hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);

      pool.query(
        `SELECT * FROM autenticaciones 
                  WHERE email = $1`,
        [email],
        (err, results) => {
          if (err) {
            throw err;
          }
          console.log(results.rows);

          if (results.rows.length > 0) {
            errors.push({ message: "Correo electronico ya registrado." });
            res.render("register", { errors });
          } else {
            pool.query(
              `INSERT INTO autenticaciones (nombre_completo, email, password)
                              VALUES ($1, $2, $3)
                              RETURNING id_autenticacion, password`,
              [name, email, hashedPassword],
              (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(results.rows);
                req.flash(
                  "success_msg",
                  "Ya estas registrado. Por favor inicia sesión."
                );
                res.redirect("/users/login");
              }
            );
          }
        }
      );
    }
  });

  app.post(
    "/users/login",
    passport.authenticate("local", {
      successRedirect: "/users/dashboard",
      failureRedirect: "/users/login",
      failureFlash: true,
    })
  );
};
