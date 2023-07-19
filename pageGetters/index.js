const axios = require('axios');
const cheerio = require('cheerio');
const {AsyncParser} = require('@json2csv/node');
const fs = require('fs').promises;
const {mkdirp} = require('mkdirp')
const moment = require('moment');

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
                    x.office = chamber;
                    all_data.push(x)
                });
            } else {
                continue_loop = false;
            }
            
            await page ++;
        }
        return all_data
    }

    async paginateBoth(){
        const state_senate = await this.paginate('state-senate');
        const state_house = await this.paginate('state-house');

        const total_array = [];
        state_senate.map(x=>{
            total_array.push(x);
        });
        state_house.map(x=>{
            total_array.push(x);
        });
        console.table(total_array)

        return total_array;
    }

    async dataToCSV(data){
        const opts = {};
        const transformOpts = {};
        const asyncOpts = {};
        const parser = new AsyncParser(opts, transformOpts, asyncOpts);

        const csv = await parser.parse(data).promise();
        return csv;
    }

    async allDataCSV(){
        const data = await this.paginateBoth();

        const csv = await this.dataToCSV(data);
        const path = `allCandidateData${moment().format('YYYY_MM_DDHH_m_s')}.csv`;
        // await mkdirp(path);
        await fs.writeFile(path, csv);
        // console.log(csv)
    }


}

// const act_blue = new ActBlue()
// act_blue.allDataCSV()

module.exports = ActBlue