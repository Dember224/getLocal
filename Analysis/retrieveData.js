const {Op}=require('sequelize');
const getStorage = require('../Storage');

function StateDataRetriever(models) {
  this.CandidateSearch = models.CandidateSearch;
  this.CampaignFinance = models.CampaignFinance;
  this.Candidacy = models.Candidacy;
  this.CandidateSearch.hasOne(this.CampaignFinance, {
    foreignKey: 'candidacy_id'
  });
  this.CandidateSearch.hasOne(this.Candidacy, {
    foreignKey: 'candidacy_id'
  })
  this.CampaignFinance.belongsTo(this.CandidateSearch, {
    foreignKey: 'candidacy_id'
  })
  this.Candidacy.hasOne(this.CandidateSearch, {
    foreignKey: 'candidacy_id'
  })
}

StateDataRetriever.prototype.retrieveStateData = async function(state_list, year) {
  let state_map = state_list
  if(typeof state_list !== 'array'){
    state_map = [state_list]
  }
  state_map = state_map.map(x=>{ return x.toLowerCase()})
  let search_year = parseInt(year);
  if(isNaN(search_year)) throw new Error('Please enter the year of the race you are looking for')


    const candidates = await this.CandidateSearch.findAll({
      where: {
        state_name:{
          [Op.in]: state_map
        },
        year: search_year
      },
      include:[
        {
          model: this.CampaignFinance
        },
        {
          model: this.Candidacy
        }
      ]
  })
  let candidate_map =  candidates.map(x=>{
    if(x["CampaignFinance"] && x["Candidacy"]){
      const return_array = {
        first_name: x.first_name,
        last_name: x.last_name,
        party: x.party,
        state: x.state_name,
        district: x.district,
        chamber_level: x.chamber_level,
        year: x.year,
        election_type: x.election_type,
        expenditures: x["CampaignFinance"].expenditures,
        contributions: x["CampaignFinance"].contributions,
        votes: x["Candidacy"].votes,
        election_id: x["Candidacy"].election_id
      }
      return return_array
    }
  })
  candidate_map = candidate_map.filter(x=>{return x != undefined})

    return candidate_map

}


async function retriever(state, year) {
  const storage = await getStorage()

  const retriever = new StateDataRetriever(storage.models)
  return await retriever.retrieveStateData(state, year)
}

async function races(state, year){
  const retrieval = retriever(state, year).then( (r)=>{
    const races = r.map(candidate_object=>{
      const single_race = r.filter(x=>{
        return x.election_id == candidate_object.election_id
      })
      return single_race;
    })

    return races.filter((value, index) => {
      const _value = JSON.stringify(value);
      return index === races.findIndex(obj => {
        return JSON.stringify(obj) === _value;
      });
    });
  });
  await retrieval;
  return retrieval
}

async function closest_races_by_state(state, year, closest_x_races) {
  const get_close = races(state, year).then( (r)=>{
    const races = r.filter(x=>{return x.length > 1});
    const race_proportions = races.map(race=>{
      let vote_total = 0
      race.map(candidate=>{
        vote_total += candidate.votes
      })

      const race_with_percentage = race.map(candidate=>{
        candidate['vote_percentage'] = candidate.votes / vote_total;
        return candidate;
      })

      return race_with_percentage.sort((a,b)=>{
        return b.vote_percentage - a.vote_percentage;
      });
    })

    let race_with_margin = race_proportions.map(race=>{
      let top_spot_percentage_differential = null;
      if(race[0].party == 'democratic' || race[1].party == 'democratic'){
        top_spot_percentage_differential = race[0].vote_percentage - race[1].vote_percentage ;
      }

      const return_object = {
        top_spot_percentage_differential,
        race
      }
      return return_object;
    })
    race_with_margin = race_with_margin.filter(x=>{
      return x.top_spot_percentage_differential != null;
    });
    race_with_margin = race_with_margin.sort((a,b)=>{
      return a.top_spot_percentage_differential - b.top_spot_percentage_differential;
    })
    return race_with_margin.slice(0, closest_x_races)

  })
  await get_close
  return get_close
}
// closest_races('North Carolina', 2020, 10).then((r)=>{
//   r.map(x=>{
//     console.log(x)
//   })
// })

module.exports = {
  retriever,
  races,
  closest_races_by_state
}
