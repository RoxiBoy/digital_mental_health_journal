const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const connect_db = async () => {
  try{
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Sucessfully connected to Database")
  }catch(err){
    console.log(`Error connecting to database: ${err}`)
  }
}

module.exports = connect_db;



