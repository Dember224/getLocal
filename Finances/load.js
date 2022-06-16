const {Op}=require('sequelize');
const {parseFullName} = require('parse-full-name');

function CampaignFinanceLoader(models){
  this.CampaignFinance = models.CampaignFinance;
  this.Candidate = models.Candidate;
  this.Candidacy = models.Candidacy;
  this.State = models.State;
  this.Election = models.Election;
}

CampaignFinanceLoader.prototype.loadCampaignFinances = async function(finance_array) {
  const state_name = finance_array[0].state.toLowerCase();
  const state = await this.candidate.findOne({
    where: {
      name: state_name
    }
  })
  for(const finance_object of finance_array) {
    const candidate_full_name = finance_object.name;
    const party = finance_object.party.toLowerCase();

    const parsedName = parseFullName(candidate_full_name);
    const candidate = await this.Candidate.findOrCreate({
      where: {
        first_name: parsedName.first,
        last_name: parseName.last,
        party:party,
        state_id = state.state_id
      }
    })
    const election_date = new Date(finance_object.election_year);
    const election_year = election_date.getFullYear();
    const party = finance_object.party.toLowerCase();
    const election = await this.Election.findOne({
      where: {
        year:election_year,
        party: party,
        type: finance_object.election_type.toLowerCase(),
      }
    })

    const candidacy = await this.Candidacy.findOne({
      where: {
        candidate_id: candidate.candidate_id,
        election_id: election.election_id
      }
    })

    const campaign_finance = await this.CampaignFinance.findOrCreate({
      where: {
        candidacy_id: candidacy.candidacy_id,
        contributions: finance_object.contributions,
        expenditures: finance_object.expenditures
      }
    })

  }
}

module.exports = {
  CampaignFinanceLoader
}
