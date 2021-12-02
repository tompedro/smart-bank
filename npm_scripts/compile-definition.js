#!/usr/bin/env node
/* eslint-disable no-console */
const { join } = require("path")
const { writeFileSync, mkdirSync } = require("fs")
const { copySync } = require("fs-extra")
const definition = require("../src/openapi/definition.js")

try {
  mkdirSync(join(__dirname, "../build/openapi/"), { recursive: true })
} catch (e) {
  console.error(e)
}

writeFileSync(join(__dirname, "../build/openapi/definition.json"), JSON.stringify(definition, null, 2))

console.log("build/definition.json created")

process.exit(0)