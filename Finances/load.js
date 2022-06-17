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

CampaignFinanceLoader.prototype.loadCampaignFinances = async function(finance_array) {
  const state_name = finance_array[0].state.toLowerCase();

  for(const finance_object of finance_array) {
    const candidate_full_name = finance_object.name;
    const party = finance_object.party.toLowerCase()  == 'democrat' ? 'democratic' : finance_object.party.toLowerCase() ;

    const parsedName = parseFullName(candidate_full_name);

    const election_date = new Date(finance_object.election_year);
    const election_year = election_date.getFullYear();


    let level = finance_object.office;
    if(level.includes('house') || level.includes('lower')) level = 0;
    if(level.includes('senat') || level.includes('upper')) level = 1;

    const candidateSearch = await this.CandidateSearch.findOne({
      where:{
        first_name:parsedName.first,
        last_name:parsedName.last,
        party:party,
        state_name,
        district:finance_object.district,
        chamber_level:level,
        year: election_year,
        election_type: finance_object.election_type.toLowerCase()

      }
    })

    const campaign_finance = await this.CampaignFinance.findOrCreate({
      where: {
        candidacy_id: candidateSearch.candidacy_id,
        contributions: finance_object.contributions,
        expenditures: finance_object.expenditures
      }
    })


  }
}

module.exports = CampaignFinanceLoader
