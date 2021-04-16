const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');
const async = require('async');

const pool = new Pool(dbConfig.config)

const loadFinanceArray = async function(finance_array){
  await pool.connect((e,client,release)=>{
    async.mapSeries(finance_array, (money_object,cb)=>{
      if(e) return e;
      console.log('Money object logged', money_object)
      const name = money_object.name;
      const office = money_object.office;
      const state = money_object.state;
      const district = money_object.district;
      const contributions = money_object.contributions;
      const expenditures = money_object.expenditures;
      const asOf = money_object.asOf;
      const election_year = money_object.election_year;
      const election_type = money_object.election_type;
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
      client.query(text,values,(e,r)=>{
        if(e) return e;
        console.log("These are the values", values)
        if(r.length === 0) {
          console.log("The method didn't load anything")
          return cb(null,r);
        };
        return cb(null, r);
      })

  }, (e,r)=>{
    if(e) return e;
    release()
    return r;
    })
  })
}
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
  loadFinanceArray,
  loadFinanceData
}
