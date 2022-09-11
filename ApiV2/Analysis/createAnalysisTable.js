const {Op}=require('sequelize');
const getStorage = require('../Storage');

function LoadAnalysis(models) {
  this.Election = models.Election;

}

LoadAnalysis.prototype.loadElectionAnalysis = async function(models){
  let elections = await this.Election.getElections({
    year: 2022,
    state: 'pennsylvania'
  },[{
    model: models.Candidacy,
    include:[{
      model: models.CampaignFinance
    }, {
      model: models.Candidate
    }]
  }]);

  const clean_elections = elections.map(election =>{
    const candidacies = election["Candidacies"]
    const candidacy_object = {}

    candidacies.map((candidacy, index)=>{
      const candidate = candidacy["Candidate"]
      if(!candidacy_object[`${candidate.party}_candidate_${index}`]){
        candidacy_object[`${candidate.party}_candidate_${index}`] = `${candidate.first_name} ${candidate.last_name}`;
      }


    })

    console.log(candidacy_object)
  })
}

async function getElections(){
  const storage = await getStorage();
  const analysis = new LoadAnalysis(storage.models)
  return await analysis.loadElectionAnalysis(storage.models)
}

getElections()
