require('dotenv').config()

const config = {
  user:process.env.USER,
  host:process.env.DB_HOST,
  database:process.env.DATABASE,
  password:process.env.PASSWORD,
  port:process.env.PORT,
  ssl: {
  rejectUnauthorized: false
}
}

module.exports = {
  config
}
