const axios = require('axios');
const cheerio = require('cheerio');

class ActBlue {
    constructor(){
        this.directory_uri = 'https://secure.actblue.com/directory/all/candidate/';
    }

    async getDivList(chamber_name, page){
        const directory_response = await axios.get(this.directory_uri+chamber_name, { params: { page } });
        const body = directory_response.data;
        const $ = cheerio.load(body);
        const website_html = $('div.entity-container.row-fluid');

        const website_array = [];


        website_html.each((i, div)=>{
            const html = $(div).html()
            website_array.push(html)
        })
        return website_array;

    }

    async acquireDataFromDiv(div){
        const $ = await cheerio.load(div);
        const fn = $('a.fn');
        const name = fn.text();
        const fundraiser = fn.attr('href');
        const website = $('.hidden-phone a').attr('href')
        const race = $('.location').text()

        const return_object = {
            name,
            fundraiser,
            website,
            race
        }
        return return_object
    }

    async retrieveDataFromDivList(chamber, page){
        const div_list = await this.getDivList(chamber, page)
        const data_list = [];

        for await (const div of div_list){
            const data = await this.acquireDataFromDiv(div);
            data_list.push(data)
        }
        console.log(data_list)
        return data_list;

    }

    async paginate(chamber){
        let continue_loop = true;
        const all_data =[];
        let page = 1; 
        while(continue_loop){
            const page_list = await this.retrieveDataFromDivList(chamber, page);
            if(page_list.length){
                page_list.map(x=>{
                    all_data.push(x)
                });
            } else {
                continue_loop = false;
            }
            
            await page ++;
        }
        console.log(all_data)
    }


}

const act_blue = new ActBlue()
act_blue.paginate('state-senate')