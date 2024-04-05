const dotenv=require('dotenv').config();
module.exports = {
          MONGO_DB_URL : process.env.MONGO_DB_URL,
          JWT_SECRET : process.env.JWT_SECRET
}