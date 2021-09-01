require('dotenv').config()

const config = {
  host:"ec2-52-4-111-46.compute-1.amazonaws.com",
  database:"d46j56mor454pk",
  user:"sdrqymbeyaoopw",
  port:"5432",
  password:"61f6f562cdda696d9b6354077b7f4b702d56cbc75f925d731ed749bf31410a2c",
  ssl: {
  rejectUnauthorized: false
}
}


module.exports = {
  config
}
