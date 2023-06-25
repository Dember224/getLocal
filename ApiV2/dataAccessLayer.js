const {Sequelize, QueryTypes} = require('sequelize');
const fullStateQuery = require('./queries/dataByState');
const {AsyncParser} = require('@json2csv/node');
require('dotenv').config()


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
        const results = await this.sequelize.query(query,
            {
                replacements: arg_object,
                type: QueryTypes.SELECT
            }
        )
        return results;
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


};


module.exports = DataAccess

