/* eslint-disable eqeqeq */
const e = module.exports
const { pool, CodedError, ErrorCodes } = require("../utils.js")
const jwt = require("jsonwebtoken")
const debug = require("debug")("api")
const bcrypt = require("bcryptjs")
const { createHmac } = require("crypto")
const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "4h"
const pepper = process.env.pepper || "KSJDFHJSKDHFJS238U48U8DJAJSD"
const csv = require('csv-parser')
const fs = require('fs')

const getPasswordHmac = (password, pepper) => {
  return createHmac("sha256", pepper)
    .update(password)
    .digest("hex")
}

const createCsvWriter = require('csv-writer').createObjectCsvWriter
const csvWriter = createCsvWriter({
  path: './csv/users.csv',
  header: [
    {id: 'id', title: 'id'},
    {id: 'firstName', title: 'firstName'},
    {id: 'lastName', title: 'lastName'},
    {id: 'account', title: 'account'},
    {id: 'pin', title: 'pin'},
  ]
})


e.logIn = async({ body: { account, pin } }, res) => {
  try{
    fs.createReadStream('./csv/users.csv')
      .pipe(csv())
      .on('data', (row) => {
        if(account == row.account && pin == row.pin){
          res.status(200).send({
            JWT: jwt.sign({ id: row.id, account: row.account, role: 1 }, secret, { algorithm: "HS512", expiresIn: "24h" }),
          })
        }
      })
      .on('end', () => {
        res.status(500)
      })
  } catch(err){
    res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
  }
}

e.signUp = async({ body, body: { firstName, lastName, account } }, res) => {
  try {
    let pins = []

    fs.createReadStream('./csv/users.csv')
      .pipe(csv())
      .on('data', (row) => {
        if(row.account == account){
          throw new Error("già esistente")
        }
        pins.push(row.pin)
      })
      .on('end', () => {
        let genP = Math.floor(Math.random() * 1000)
        let c = true

        while(c){
          c = false
          pins.forEach(p => {
            if(p === genP) c = true
          })
        }

        const data = [{ id: pins.length+1, firstName, lastName, account, pin: genP }]

        csvWriter
        .writeRecords(data)
        .then(()=> console.log('The CSV file was written successfully'))


        res.status(200).send({
          JWT: jwt.sign({ id: pins.length+1, account: body.account, role: 1 }, secret, { algorithm: "HS512", expiresIn: "24h" }),
          pin: genP.toString()
        })
        
      })
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
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