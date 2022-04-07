const axios = require('axios');
const cheerio = require('cheerio');

const getStateFips =  function(state, callback) {
  const state_name = state.toLowerCase();
  axios.get('https://www.nrcs.usda.gov/wps/portal/nrcs/detail/?cid=nrcs143_013696')
  .then((response)=>{
    const $ = cheerio.load(response.data);
    const tbody = $('.data').text()
    const split_body = tbody.split('\t\t\n\t\t\n')
    const body_array = split_body.map(x=>{
      return x.split('\n').map(y=>{return y.trim()})
    })
    const matching_array = body_array.find(x=>{
      return x[1].toLowerCase() == state_name;
    })
    return callback(null, matching_array[5]);
  })
  .catch((e)=>{
    return callbacK(e);
  })
}

module.exports = {
  getStateFips
}
