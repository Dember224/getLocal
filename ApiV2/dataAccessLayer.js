const {Sequelize, QueryTypes} = require('sequelize');
const {AsyncParser} = require('@json2csv/node');
require('dotenv').config()

//List of query imports here so the directory isn't littered with SQL
const fullStateQuery = require('./queries/dataByState');
const availableStateQuery = require('./queries/availableStates');


class DataAccess {
    constructor(){
        this.db_ssl = (process.env.DB_USE_SSL != 'false');
        this.db_uri = process.env.DB_URL_PROD;
        this.opts = {
            dialect:'postgres',
            dialectOptions: {
              ssl: {
                rejectUnauthorized: false
              }
            }
         };
         if(this.db_ssl === false) delete this.opts.dialectOptions;
        this.sequelize = new Sequelize(this.db_uri, this.opts)
    }

    async runQuery(query, arg_object) {
        if(arg_object){
            const results = await this.sequelize.query(query,
                {
                    replacements: arg_object,
                    type: QueryTypes.SELECT
                }
            )
            return results;
        } else {
            const results = await this.sequelize.query(query,
                {
                    type: QueryTypes.SELECT
                }
            )
            return results;
        }
        
    }

    async dataToCSV(data){
        const opts = {};
        const transformOpts = {};
        const asyncOpts = {};
        const parser = new AsyncParser(opts, transformOpts, asyncOpts);

        const csv = await parser.parse(data).promise();
        return csv;
    }

    async fullStateData(state, year) {
        const replacements = {
            state,
            year
        }
        const state_data = await this.runQuery(fullStateQuery, replacements);
        return state_data;
    }

    async fullStateDataCsv(state, year){
        const state_data = await this.fullStateData(state, year);
        const csv_data = await this.dataToCSV(state_data);
        return csv_data
    }

    async checkAvailableStates(){
        const available_state_array = await this.runQuery(availableStateQuery);
        const cleaned_available_state_array = []
        available_state_array.map(state_object=>{
            const just_this_state = available_state_array.filter(x=>{
                return x.state_name === state_object.state_name
            });
            const return_object = {
                state_name: just_this_state[0].state_name,
                years:[]
            };

            just_this_state.map(x=>{
                return_object.years.push(x.year)

            });

            if(!cleaned_available_state_array.length){
                cleaned_available_state_array.push(return_object);
            } else {
                if(!cleaned_available_state_array.find(x=>{
                    return x.state_name === state_object.state_name
                })){
                    cleaned_available_state_array.push(return_object)
                }
            }


        })
        return cleaned_available_state_array;
    }

    async checkForStateData(state, year){
        const available_state_array = await this.checkAvailableStates();
        const state_object = available_state_array.find(state_object=>{
            return state_object.state_name === state;
        });

        if(!state_object){
            return false;
        } else {
            return state_object.years.includes(year);
        }
    }


};

const data = new DataAccess()
data.checkAvailableStates();


module.exports = DataAccess

