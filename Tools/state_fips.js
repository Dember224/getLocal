const axios = require('axios');
const cheerio = require('cheerio');


const getStateFips = async function(state){

  try{
    const response = await axios.get('https://en.wikipedia.org/wiki/Federal_Information_Processing_Standard_state_code');
    const $ = cheerio.load(response.data);

    const html = $(`tbody  `).html().split('tr').find(x=>{
      return x.includes(state)
    });

    const fips = html.split(/<td>|<\/td>/)[5]
    if(state == 'Washington'){
      return 53;
    } else {
      return fips
    }
    

  } catch(e){
    throw new Error(`Failed to get state fips with error ${e}`)
  }
}

module.exports = {
  getStateFips
}



