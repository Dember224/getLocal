const {Op}=require('sequelize');
const {parseFullName} = require('parse-full-name')


function CampaignFinanceLoader(models){
  this.CampaignFinance = models.CampaignFinance;
  this.Candidate = models.Candidate;
  this.Candidacy = models.Candidacy;
  this.State = models.State;
  this.Election = models.Election;
  this.CandidateSearch = models.CandidateSearch;
}

function ProcessLevel(office){
  let level = office.toLowerCase();
  if(level.includes('house') || level.includes('lower') || level.includes('rep')) {
    return 0;
  } else if(typeof level == 'string'){
    if(level.includes('senat') || level.includes('upper')){
      return 1;
    }
  } else {
    return -1;
  }
}

CampaignFinanceLoader.prototype.loadCampaignFinances = async function(finance_array) {
  const state_name = finance_array[0].state.toLowerCase();

  for(const finance_object of finance_array) {
    const candidate_full_name = finance_object.name;
    let party = `${finance_object.party}`
    party = party.toLowerCase()  == 'democrat' ? 'democratic' : party.toLowerCase() ;

    const parsedName = parseFullName(candidate_full_name);

    const election_date = new Date(finance_object.election_year);
    const election_year = election_date.getFullYear();


    let level = ProcessLevel(finance_object.office)

    const candidateSearch = await this.CandidateSearch.findOne({
      where:{
        first_name:parsedName.first,
        last_name:parsedName.last,
        party:party,
        state_name,
        district:finance_object.district ? finance_object.district : null,
        chamber_level:level || null,
        year: election_year,
        election_type: finance_object.election_type.toLowerCase()

      }
    })
    const contributions = finance_object.contributions ? finance_object.contributions : null;
    const expenditures = finance_object.expenditures ? finance_object.expenditures : null;

    if(candidateSearch){
      const campaign_finance = await this.CampaignFinance.findOrCreate({
        where: {
          candidacy_id: candidateSearch.candidacy_id,
        },
        defaults:{
          candidacy_id: candidateSearch.candidacy_id,
          contributions: contributions,
          expenditures:expenditures
        }
      })
    }



  }
}

module.exports = CampaignFinanceLoader
