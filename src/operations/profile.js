/* eslint-disable eqeqeq */
const e = module.exports
const { CodedError, ErrorCodes } = require("../utils.js")
const jwt = require("jsonwebtoken")
const { createHmac } = require("crypto")
const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "4h"
const pepper = process.env.pepper || "KSJDFHJSKDHFJS238U48U8DJAJSD"
const csv = require('csv-parser')
const fs = require('fs')

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

const csvWriterBalance = createCsvWriter({
  path: './csv/balances.csv',
  header: [
    {id: 'id', title: 'id'},
    {id: 'userId', title: 'userId'},
    {id: 'balance', title: 'balance'}
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
          .then(()=> {
            console.log('The CSV file was written successfully')

            csvWriterBalance
              .writeRecords([{id: pins.length+1, userId: pins.length+1, balance: 0}])
              .then(()=> {
                console.log('The CSV file was written successfully 2')

                res.status(200).send({
                  JWT: jwt.sign({ id: pins.length+1, account: body.account, role: 1 }, secret, { algorithm: "HS512", expiresIn: "24h" }),
                  pin: genP.toString()
                })
              })
          })
      })
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
  }

}

e.getInfo = async({ user: { id, role }, body, body: { userId } }, res) => {
  try {
    let user
    fs.createReadStream('./csv/users.csv')
      .pipe(csv())
      .on('data', ({id: rowId, firstName, lastName, account}) => {
        if(rowId == id){
          user = { id: parseInt(rowId), firstName, lastName, account }

          fs.createReadStream('./csv/balances.csv')
            .pipe(csv())
            .on('data', ({userId, balance}) => {
              if(userId == id){
                res.status(200).send({user: { ...user, balance: parseInt(balance)} })
              }
            })
            .on('end', () => {
              res.status(500)
            })
        }
      })
    
    
      
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
  }
}