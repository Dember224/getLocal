const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');

const pool = new Pool(dbConfig.config)

const loadFinanceData = function(callData){
  const name = callData.name;
  const office = callData.office;
  const state = callData.state;
  const district = callData.district;
  const contributions = callData.contributions;
  const expenditures = callData.expenditures;
  const asOf = callData.asOf;
  const election_year = callData.election_year;
  const election_type = callData.election_type;
  const text = 'INSERT INTO campaign_finance(name,office, state, district, contributions, expenditures, asOf, election_year, election_type) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *';
  const values = [
    name,
    office,
    state,
    district,
    contributions,
    expenditures,
    asOf,
    election_year,
    election_type
  ];
  pool.connect((e,client, release)=>{
    if(e) return e;
    client.query(text,values,(e,r)=>{
      if(e) return e;
      console.log("These are the values", values)
      if(r.length === 0) {console.log("The method didn't load anything")};
      if(callData.finished){pool.end()};
    })
  })
}

module.exports = {
  loadFinanceData,
  pool
}
