const axios = require('axios');
const cheerio = require('cheerio');

async function getActBluePage(first_name, last_name){
    try{
        const url = `https://secure.actblue.com/directory`;
        const query = `${first_name} ${last_name}`;

        const results = await axios.request({
            url,
            method:'get',
            params:{query},
            withCredentials: false
        });
        const body = results.data;
        const $ = cheerio.load(body);

        const donation_link = $('.contribute').attr('href');
        const candidate_profile = $(".hidden-phone a").attr('href');
        console.log(candidate_profile)

        return {donation_link, candidate_profile}

    } catch(e) {
        console.log(e);
    }
}


module.exports = getActBluePage