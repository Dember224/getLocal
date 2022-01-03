const DBF = require('stream-dbf');
const toArray = require('stream-to-array');
const state_array = require('../../StateMap').state_array;
const async = require('async');
const { existsSync } = require('fs');
const dbConfig = require('../../Loaders/dbConfig').config;
const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool(dbConfig);


function chamberCheck(chamber){
  const case_correct_chamber = chamber.toLowerCase();
  if(case_correct_chamber === 'upper'){
    return 'u';
  } else if(case_correct_chamber === 'lower'){
    return 'l';
  } else {
    throw Error('The chamber options are upper and lower');
  }
}

const viewFile = function(callData, callback){
  const file_name = `./fipCodes/${callData.state}/${callData.year}${callData.chamber}.dbf`;
  if(existsSync(file_name)){
    const parser = new DBF(file_name, {lowercase:true})
    const stream = parser.stream;

    const dist_identifier = `sld${chamberCheck(callData.chamber)}st`;

  const record_stream = stream.on('data', (record)=>{
      return record;
    })

    toArray(record_stream, (e, record_array)=>{
      if(e) return callback(e);

      const return_array = record_array.map(record =>{
        const return_object = {
          state_name: callData.state,
          state_fip: parseInt(record.statefp),
          district: parseInt(record[dist_identifier]),
          chamber_name: record.namelsad.replace(/[0-9]/g, '').replace(/District/, "").trim(),
          chamber: callData.chamber,
          year:callData.year,
          latitude:parseFloat(record.intptlat),
          longitude:parseFloat(record.intptlon)
        }
        return return_object
      })
      return callback(null, return_array);
    })
  } else {
    return callback(null,null)
  }

}


// viewFile({year:2021, chamber:'lower', state:'Alabama'},(e,r)=>{
//   if(e) return e;
//   console.log(r);
// })

const viewAllFiles = function(callData, callback){
  async.map(state_array, (state, cb)=>{
    async.autoInject({
      get_lower:(call)=>{
        viewFile({year:callData.year, chamber:'lower', state}, (e,fip_object)=>{
          if(e) return call(e);
          return call(null, fip_object);
        })
      },
      get_upper:(call)=>{
        viewFile({year:callData.year, chamber:'upper', state}, (e,fip_object)=>{
          if(e) return call(e);
          return call(null, fip_object);
        })
      }
    }, (e,r)=>{
      if(e) return cb(e);
      const total_object = [];
      if(r.get_lower){
        r.get_lower.map(x=>{
          total_object.push(x);
        })
      }
      if(r.get_upper){
        r.get_upper.map(x=>{
          total_object.push(x);
        })
      }

      return cb(null, total_object)
    })
  }, (e, all_fips)=>{
    if(e) return callback(e);
    const grand_fip_array = [];

    all_fips.map(fip_array=>{
      fip_array.map(fip_object=>{
        const return_array = [
          fip_object.state_name,
          fip_object.state_fip,
          fip_object.district,
          fip_object.chamber_name,
          fip_object.chamber,
          fip_object.year,
          fip_object.latitude,
          fip_object.longitude
        ];
        if(!return_array.includes(NaN)){
          grand_fip_array.push(return_array);
        }
      })
    })
    return callback(null, grand_fip_array);
  })
}


const loadFipCodes = function(callData){
  viewAllFiles({year:callData.year}, (e, fip_array)=>{
    if(e) console.log(e);
    const text = 'INSERT INTO fips_by_state_chamber_district (state_name, state_fip, district, chamber_name, chamber, year, latitude, longitude) VALUES %L Returning *';
    const values = fip_array;
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
  })
}

loadFipCodes({year:2021})
