/* eslint-disable eqeqeq */
const e = module.exports
const { pool, CodedError, ErrorCodes } = require("../utils.js")
const jwt = require("jsonwebtoken")
const debug = require("debug")("api")
const bcrypt = require("bcryptjs")
const { createHmac } = require("crypto")
const secret = process.env.AUTH_JWT_PRIVATE_KEY || "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "4h"
const pepper = process.env.pepper || "KSJDFHJSKDHFJS238U48U8DJAJSD"

const getPasswordHmac = (password, pepper) => {
  return createHmac("sha256", pepper)
    .update(password)
    .digest("hex")
}

e.logIn = async({ body: { email, password } }, res) => {
  const query =
      `SELECT
        JSON_OBJECT (
            'userId', id,
            'email', email,
            'password', password
        ) AS data
        FROM users
        WHERE email = ? AND status = 'Verified';`

  if (!email || !password) {
    return res.error(new CodedError("Check email or password", ErrorCodes.BAD_REQUEST), 400)
  }

  try {
    const [[data]] = await pool.promise().query(query, [email])

    if (data) {
      const { userId, email, password: passwordDB } = data.data

      if (bcrypt.compareSync(getPasswordHmac(password, pepper), passwordDB)) {
        const JWT = jwt.sign(
          { id: userId, email, role: 1 },
          secret,
          { algorithm: "HS512", expiresIn }
        )
        res.json({ JWT })
      } else {
        res.error(new CodedError("Check email and password", ErrorCodes.UNAUTHORIZED), 401)
      }
    } else {
      res.error(new CodedError("Check email and password", ErrorCodes.UNAUTHORIZED), 401)
    }
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.SQL_ERROR), 500)
  }
}

e.signUp = async({ body }, res) => {
  let query = "INSERT INTO users "
  const finalFields = []
  const values = []
  try {
    "firstName, lastName, email, password, gender, class, status".split(", ")
      .forEach(field => {
        finalFields.push(field)
        if (body[field]) {
          values.push(body[field])
        } else {
          if (field == "gender") {
            values.push(body.sex)
          } else if (field == "class") {
            values.push("Studente")
          } else if (field == "status") {
            values.push("Unverified")
          }
        }
      })

    query += "(" + finalFields.join(" , ") + ") VALUES (?,?,?,?,?,?,?);"
    try {
      const [{ affectedRows, insertId }] = await pool.promise().query(query, values)

      if (affectedRows) {
        res.status(200).send({
          JWT: jwt.sign({ id: insertId, email: body.email, role: 1 }, secret, { algorithm: "HS512", expiresIn: "24h" })
        })
      } else {
        res.error(new CodedError("SIGN UP FAILED", ErrorCodes.SQL_ERROR), 500)
      }

    } catch (err) {
      res.error(new CodedError(err.message, ErrorCodes.SQL_ERROR), 500)
    }
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.SQL_ERROR), 500)
  }

}

e.getInfo = async({ user: { id, role }, body, body: { userId } }, res) => {
  const query = `SELECT
                      JSON_OBJECT(
                          'firstName', firstName,
                          'lastName', lastName,
                          'class', class,
                          'pic', pic,
                          'bio', bio
                      ) as data
                  FROM users WHERE id = ?;`

  if (id !== userId && role < 420) {
    return res.error(new CodedError("You cannot access this resource", ErrorCodes.FORBIDDEN), 403)
  }

  try {
    const [data] = (await pool.promise().query(query, [id]))[0]
    if (data) {
      const d = {}
      for (const key in data.data) {
        if (data.data[key]) {
          d[key] = data.data[key]
        }
      }
      res.json(d)
    } else {
      res.error(new CodedError("Not Found", ErrorCodes.NOT_FOUND), 404)
    }
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.SQL_ERROR), 500)
  }
}