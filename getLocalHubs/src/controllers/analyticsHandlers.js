const axios = require('axios')
require('dotenv').config


const getSuggestions = async function(){
  try{
    const base_url = process.env.REACT_APP_API_URL
    const res = await axios.get(`${base_url}suggestion`)
    return res['data']
  } catch(e) {
    console.log(e);
  }

}

module.exports =  getSuggestions;
