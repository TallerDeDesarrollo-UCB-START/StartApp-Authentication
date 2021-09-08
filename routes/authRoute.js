const passport = require("passport");
const { pool } = require("../config/dbConfig");
const bcrypt = require("bcrypt");
const SETTINGS = require("../config/Settings");
const bodyParser = require("body-parser");

module.exports = (app) => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.post("/users/register", async (req, res) => {
    try {
      console.log(req.body);
      let { name, email, password, password2 } = req.body;

      if (!name || !email || !password || !password2) {
        throw { number: 404, message: "Llena todos los campos" };
      }
      if (password.length < SETTINGS.minPasswordLength) {
        throw {
          number: 404,
          message: "La clave no debe tener menos que 6 caracters",
        };
      }

      if (password != password2) {
        throw {
          number: 404,
          message: "Las claves no coinciden",
        };
      }

      // Form validation has passed
      let hashedPassword = await bcrypt.hash(password, 10);
      pool.query(
        `SELECT * FROM autenticaciones
                    WHERE email = $1`,
        [email],
        (err, results) => {
          if (err) {
            throw {
              number: 500,
              message: err,
            };
          }

          if (results.rows.length === 0) {
            pool.query(
              `INSERT INTO autenticaciones (nombre_completo, email, password)
                                  VALUES ($1, $2, $3)
                                  RETURNING id_autenticacion, password`,
              [name, email, hashedPassword],
              (err, results) => {
                if (err) {
                  throw err;
                }
                res.status(201).send("Se registro correctamente.");
              }
            );
          } else {
            res.status(400).send("Correo electronico ya registrado.");
          }
        }
      );
    } catch (err) {
      res.status(err.number).send(err.message);
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
