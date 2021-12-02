const e = module.exports
const { pool, CodedError, ErrorCodes } = require("../utils.js")
const jwt = require("jsonwebtoken")
const { createHmac } = require("crypto")
const secret = "12jiowfcmqd2093eswedfgtr54eswe3454erdsdc"
const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "4h"
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

e.getTransactions = async({body: { userId } }, res) => {
  try {
    const data = []
    fs.createReadStream('./csv/transactions.csv')
      .pipe(csv())
      .on('data', ({id: rowId, userId: rowUserId, amount, timestamp}) => {
        if(rowUserId == userId){
          timestamp = new Date(parseInt(timestamp))
          data.push({id: parseInt(rowId), value: parseInt(amount), timestamp: timestamp.toISOString()})
        } 
      })
      .on('end',() => {
        res.status(200).send({transactions: data })
      })
  } catch (err) {
    res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
  }
}

e.operate = async({ body: { userId, amount } }, res) => {
    try {
        let transactions = []
    
        fs.createReadStream('./csv/transactions.csv')
          .pipe(csv())
          .on('data', (row) => {
            transactions.push({...row})
          })
          .on('end', () => {
            const data = [{ id: transactions.length+1, userId, amount, timestamp: Date.now().toString() }]
    
            csvWriterTransactions
              .writeRecords(data)
              .then(async ()=> {
                console.log('The CSV file was written successfully')

                let rows = "id,userId,balance\r\n"
                fs.createReadStream('./csv/balances.csv')
                  .pipe(csv())
                  .on('data', ({id, userId: uId, balance}) => {
                    if(userId == uId){
                      balance = parseInt(balance) + amount
                    }
                    rows += id.toString() + "," + uId.toString() + "," + balance.toString() + "\r\n"
                  })
                  .on('end', () => {
                    fs.writeFileSync('./csv/balances.csv', rows)
                    console.log("Finished")
                    res.sendStatus(200)
                  })
              })
          })
      } catch (err) {
        res.error(new CodedError(err.message, ErrorCodes.FS_ERROR), 500)
      }
}

