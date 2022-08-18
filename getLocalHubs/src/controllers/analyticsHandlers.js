const axios = require('axios')


const getSuggestions = async function(){
  try{
    const res = await axios.get(`http://localhost:4000/suggestion`)
    return res['data']
  } catch(e) {
    console.log(e);
  }

}

module.exports =  getSuggestions;
