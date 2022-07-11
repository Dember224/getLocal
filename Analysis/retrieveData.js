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
// races('Ohio', 2020).then((r)=>{
//   console.log(r)
// })

module.exports = {
  retriever,
  races
}
