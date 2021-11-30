const e = module.exports
const { pool, CodedError, ErrorCodes } = require("../utils.js")
const jwt = require("jsonwebtoken")
const { createHmac } = require("crypto")
const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "4h"
const pepper = process.env.pepper || "KSJDFHJSKDHFJS238U48U8DJAJSD"
const csv = require('csv-parser')
const fs = require('fs')

const createCsvWriter = require('csv-writer').createObjectCsvWriter
const { time } = require("console")
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

const csvWriterTransactions = createCsvWriter({
    path: './csv/transactions.csv',
    header: [
      {id: 'id', title: 'id'},
      {id: 'userId', title: 'userId'},
      {id: 'amount', title: 'amount'},
      {id: 'timestamp', title: 'timestamp'},
    ]
})

e.getTransactions = async({ user: { id, role }, body, body: { userId } }, res) => {

}

e.operate = async({ user: { id, role }, body, body: { userId, amount } }, res) => {
    try {
        let transactions = []
    
        fs.createReadStream('./csv/transaction.csv')
          .pipe(csv())
          .on('data', (row) => {
            transactions.push({...row})
          })
          .on('end', () => {
            const data = [{ id: transactions.length+1, userId, amount, timestamp: Date.now().toString() }]
    
            csvWriterTransactions
                .writeRecords(data)
                .then(()=> {
                console.log('The CSV file was written successfully')
                //TODO: UPDATARE IL FILE BALANCE CON I NUOVI AMOUNT
                    csvWriterBalance
                    
                
                })
          })
      } catch (err) {
        res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
      }
}

