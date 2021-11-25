const { initialize } = require("express-openapi")
const express = require("express")
const { join } = require("path")
const { readdirSync } = require("fs")
const bodyParser = require("body-parser")
const debug = require("debug")("api")
const cors = require("cors")
const apiDoc = require(join(__dirname, "./openapi/definition.js"))
const jwt = require("jsonwebtoken")
const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const { CodedError, ErrorCodes } = require("./utils.js")
apiDoc.servers[0].url = apiDoc.servers[0].url.replace("{protocol}", "https")


apiDoc["x-express-openapi-additional-middleware"].push(
  (req, res, next) => {
    if (typeof res.validateResponse === "function") {
      const send = res.send
      res.send = function expressOpenAPISend(...args) {
        if (res.get("x-express-openapi-validation-error-for") !== undefined) {
          return send.apply(res, args)
        }
        let body = args[0]
        const contentType = res.get("Content-Type")
        if (contentType && contentType.includes("application/json")) {
          body = JSON.parse(body)
        }
        let validation = res.validateResponse(res.statusCode, body)
        if (validation === undefined) {
          validation = { message: undefined, errors: undefined }
        }

        const statusCode = res.statusCode
        if (Array.isArray(validation.errors)) {
          debug("%O", {
            message: `${validation.message} StatusCode: ${statusCode}`,
            details: validation.errors,
            resBody: body
          })
          // Set to avoid a loop, and to provide the original status code
          res.set("x-express-openapi-validation-error-for", res.statusCode.toString())
          res.status(500).json({
            error: {
              code: 500,
              message: `${validation.message} StatusCode: ${statusCode}`,
              details: validation.errors,
              resBody: body
            }
          })
        } else {
          return send.apply(res, args)
        }
      }
    }
    next()
  }
)
const app = express()

app.use(cors())

app.use((req, res, next) => {
  res.error = (err, statusCode = err.status || 500) => {
    res.status(statusCode).json({
      error: {
        code: err.code || ErrorCodes.GENERIC,
        message: process.env.NODE_ENV === "production" ? err.message : err.stack,
        details: err.details || null
      }
    })
  }

  next()
})

const operationsPath = join(__dirname, "./operations")
const operations = readdirSync(operationsPath)
  .map(e => require(join(operationsPath, e)))
  .reduce((acc, e) => {
    Object.assign(acc, e)
    return acc
  }, {})

initialize({
  app,
  securityHandlers: {
    BearerAuth: (req, scopes, definition) => {
      const token = (req.get("Authorization") || "").replace("Bearer ", "")
      try {
        req.user = jwt.verify(token, secret)
        return Promise.resolve(true)
      } catch ({ message }) {
        throw new CodedError(message, ErrorCodes.INVALID_JWT)
      }
    }
  },
  errorMiddleware: (err, req, res, next) => {
    if (err.status && Array.isArray(err.errors)) {
      res.status(400).json({
        error: {
          code: err.status,
          message: "Validation error",
          details: err.errors
        },
        reqBody: req.body
      })
    } else {
      res.error(err)
    }
  },
  apiDoc,
  exposeApiDocs: false,
  operations,
  consumesMiddleware: {
    "application/json": bodyParser.json()
  }
})

app.all("*", (req, res) => {
  res.error(new CodedError("Resource not found", ErrorCodes.NOT_FOUND), 404)
})

const port = process.env.PORT

app.listen(port, () => {
  debug(`api listening on port ${port}`)
})
