const dbConfig = require('./dbConfig.js');
const { Pool, Client } = require('pg');
const async = require('async');
const pgp = require('pg-promise');
const format = require('pg-format');

const pool = new Pool(dbConfig.config)

const loadFinanceArray = function(finance_array){
  const length = finance_array.length
  let place = 0;
  async.map(finance_array, (money_object,cb)=>{
    const name = money_object.name;
    const office = money_object.office;
    const state = money_object.state;
    const district = money_object.district;
    const contributions = parseFloat(money_object.contributions);
    const expenditures = parseFloat(money_object.expenditures);
    const asOf = money_object.asOf;
    const election_year = money_object.election_year;
    const election_type = money_object.election_type;
    const name_year = money_object.name_year
    const values = [
      name,
      office,
      state,
      district,
      contributions,
      expenditures,
      asOf,
      election_year,
      election_type,
      name_year
    ];
    return cb(null, values)
    console.log(place, "records loaded")
    place += 1;
}, (e,r)=>{
  if(e) return e;
  console.log("records loaded:", r);
  const text = 'INSERT INTO campaign_finance(name,office, state, district, contributions, expenditures, asOf, election_year, election_type,name_year) VALUES %L ON CONFLICT (name_year) DO NOTHING RETURNING *';
  const values = r;
  pool.connect()
  .then(client =>{
    return client
    .query(format(text, values))
    .then(res=>{
      console.log(res.rows);
      client.release()
    })
    .catch(e=>{
      console.log(e)
      client.release()
    })
  })
  return r;
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
  const name_year = money_object.name_year;
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
    election_type,
    name_year
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

const theSuperDeDuper = function(){
  const text = `DELETE FROM campaign_finance
    WHERE id IN
    (SELECT id
    FROM
        (SELECT id,
         ROW_NUMBER() OVER( PARTITION BY name_year
        ORDER BY  id ) AS row_num
        FROM campaign_finance ) t
        WHERE t.row_num > 1 );`

        pool.connect()
        .then(client =>{
          return client
          .query(format(text, values))
          .then(res=>{
            console.log(res.rows);
            client.release()
          })
          .catch(e=>{
            console.log(e)
            client.release()
          })
        })
}

module.exports = {
  loadFinanceArray,
  loadFinanceData,
  theSuperDeDuper
}
