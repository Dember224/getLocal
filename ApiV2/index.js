const storage = require('./Storage');
const { Op } = require('sequelize');

function print(data, max_length) {
  if(!data||!data.length) {
      console.log('No Data');
      return;
  }

  max_length = max_length ?? 15;
  const lengths = {};
  Object.keys(data[0]).forEach(x=>lengths[x]=0);

  const header = {};
  Object.keys(lengths).forEach(x => {
      header[x] = x;
  });
  data = [header, ...data];

  data.forEach(d => Object.keys(lengths)
      .forEach(k => lengths[k] = Math.min(Math.max(
          lengths[k],
          d[k]?.toString().length ?? 0
      ), max_length)
  ));

  data.forEach(d => {
      const cols = Object.keys(lengths).map(l => {
          const length = lengths[l];
          let value = d[l];
          if(typeof value == 'number') value = value.toFixed(2);
          value = value?.toString() ?? '';
          return value.padEnd(length).slice(0,length);
      });

      console.log(cols.join(' | '));
  });
}

async function analyzeState(state){
  const {models} = await storage();

  let elections = await models.Election.getElections({
    year: 2022, //will need to update to current year as new data comes in.
    state
  }, [{
    model: models.Candidacy,
    include: [{
      model: models.CampaignFinance
    }, {
      model: models.Candidate
    }],where:{
      votes:{
        [Op.ne]:null
      }
    }
  }]);

  // console.log(elections.length, 'total elections');
  // console.log(elections[0]);

  const elements = [];

  elections = elections.filter(x => {
    return x.type == 'general' && (x.Candidacies?.length ?? 0 > 1);
  }).sort((a,b) => {
    if (a.Office.District.Chamber === null) {
      return 1;
    }
    if (b.Office.District.Chamber === null) {
      return -1;
    }
    if(a.Office.District.Chamber.level < b.Office.District.Chamber.level) return -1;
    if(b.Office.District.Chamber.level < a.Office.District.Chamber.level) return 1;
    return a.Office.District.number - b.Office.District.number;
  });

  for(const election of elections) {
    const state = election.Office.District.Chamber ? election.Office.District.Chamber.State.name : null;
    const year = election.year.toString();
    const type = election.type;
    const district = election.Office.District.number.toString();
    const chamber = election.Office.District.Chamber ? election.Office.District.Chamber.name : null;
    // const level = election.Office.District.Chamber.level.toString();
    const byParty = {};
    election.Candidacies.forEach(c => {
      // const {votes} = c;
      const {party} = c.Candidate;
      const {contributions = 0, expenditures = 0} = c.CampaignFinance ?? {};
      const first_name = c.Candidate.first_name;
      const last_name = c.Candidate.last_name;
      byParty[party] = {
        contributions,
        expenditures,
        first_name,
        last_name
      };
    });

    const {
      democratic, republican,
    } = byParty;


    const previous = await election.getPreviousElections();
    const turnouts = [];
    let votes;
    const mostRecent = previous[0];
    if(previous[0]){
       votes = await mostRecent.getVotesByParty();



      for(let a of previous) {
        turnouts.push(await a.getTurnout());
      }

      const voteSwing = (votes.democratic??0) - (votes.republican??0);

      elements.push({
        state,
        year,
        chamber,
        district,
        year,
        type,
        previous: previous.map(x => x.year).join(', '),
        turnouts: turnouts.join(', '),

        demCon: democratic?.contributions,
        demExp: democratic?.expenditures,
        repCon: republican?.contributions,
        repExp: republican?.expenditures,

        lastDemVotes: votes.democratic?.toString(),
        lastRepVotes: votes.republican?.toString(),

        voteSwing: voteSwing.toString(),
        votePct: (voteSwing / turnouts[0] * 100).toFixed(2),
        demFirstName: democratic?.first_name,
        demLastName: democratic?.last_name,
        repFirstName: republican?.first_name,
        repLastName: republican?.last_name
      });
        }
  }
  // console.log(elements)
  // print(elements, 40)
    return await elements;
}

module.exports = analyzeState
