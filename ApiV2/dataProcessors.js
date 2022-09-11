const elements = require('./index.js');

const select_random_by_close_votes = async (race_spread)=>{
  const races = await elements;
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
  return random_race;
}

module.exports = {select_random_by_close_votes}
