const e = module.exports
const { join } = require("path")
const { readFileSync } = require("fs")
const htmlDocs = readFileSync(
  join(__dirname, "../../build/api-docs.html"),
  "utf-8"
)
const jsonDocs = require("../../build/openapi/definition.json")

e.docs = (req, res) => {
  res.send(htmlDocs)
}

e.definition = (req, res) => {
  res.json(jsonDocs)
}

e.definition = (req, res) => {
  res.json(jsonDocs)
}