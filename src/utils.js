const mysql = require("mysql2")

const e = module.exports

e.ErrorCodes = [
  "NOT_FOUND",
  "SQL_ERROR",
  "GENERIC",
  "BAD_REQUEST",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "INVALID_JWT",
  "STRIPE_ERROR",
  "PAYPAL_ERROR",
  "FS_ERROR"
].reduce((acc, e) => {
  acc[e] = e
  return acc
}, {})

e.CodedError = class extends Error {
  constructor(message, code = e.ErrorCodes.GENERIC) {
    super(message)
    this.code = code
  }
}

e.pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: "root", // ess.env.MYSQL_USER,
  password: "root", // process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  connectionLimit: 10
})

e.handleError = (err, res) => {
  switch (err.code) {
    case e.ErrorCodes.NOT_FOUND: {
      return res.error(err, 404)
    }
    case e.ErrorCodes.SQL_ERROR: {
      return res.error(err, 500)
    }
    case e.ErrorCodes.GENERIC: {
      return res.error(err)
    }
    case e.ErrorCodes.BAD_REQUEST: {
      return res.error(err, 400)
    }
    case e.ErrorCodes.UNAUTHORIZED: {
      return res.error(err, 401)
    }
    case e.ErrorCodes.FORBIDDEN: {
      return res.error(err, 403)
    }
    case e.ErrorCodes.INVALID_JWT: {
      return res.error(err, 400)
    }
    case e.ErrorCodes.STRIPE_ERROR: {
      return res.error(err, 500)
    }
    case e.ErrorCodes.FS_ERROR: {
      return res.error(err, 500)
    }
    case e.ErrorCodes.PAYPAL_ERROR: {
      return res.error(err, 500)
    }
    default: {
      return res.error(err, 500)
    }
  }
}