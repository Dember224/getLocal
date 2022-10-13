const elements = require('./index.js');
const {Sequelize} = require('sequelize');
const db_uri = process.env.DB_URL_PROD;
const db_ssl = (process.env.DB_USE_SSL != 'false');

const select_random_by_close_votes = async (race_spread, state)=>{//modify to pass state name in addition to race spread
  const races = await elements(state);
  const competitive = races.filter(race=>{
    const has_race = race.lastDemVotes && race.lastRepVotes && race.demCon && race.demExp && race.repCon && race.repExp
    if(has_race){
      return race;
    }
  })

  const sorted_competitive = competitive.sort((a,b)=>{
    return Math.abs(parseFloat(a.votePct)) - Math.abs(parseFloat(b.votePct));
  })


  const most_competitive = sorted_competitive.splice(0,race_spread);

  const random_race = most_competitive[Math.floor(Math.random() * most_competitive.length)];
  console.log(random_race)
  return random_race;
}

const select_random_close_votes_by_random_state = async(race_spread)=>{
  try{
    const opts = {
      dialect:'postgres',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false
        }
      }
   };
  if(db_ssl === false) delete opts.dialectOptions;
  const sequelize = new Sequelize(db_uri, opts);
  
    const states_with_elections_query = `Select Distinct s.name, s.state_id 
    from "Candidates" c 
    Inner Join "States" s 
    on s.state_id = c.state_id
    Inner Join "Candidacies" cd 
    on cd.candidate_id = c.candidate_id
    Inner Join "Elections" e 
    on e.election_id = cd.election_id
    and e.year = 2022
    and e.type = 'general'
    `
    const cs = await sequelize.query(states_with_elections_query);
    const query_results = cs[0];
    const pseudo_random_state_number = Math.floor(Math.random()*query_results.length);
    const random_state = cs[0][pseudo_random_state_number].name
    const results = await select_random_by_close_votes(race_spread, random_state)
    console.log(results)
  } catch(e) {
    throw new Error(e)
  }

}

select_random_close_votes_by_random_state(5)
module.exports = {select_random_by_close_votes}
