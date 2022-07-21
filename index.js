const storage = require('./Storage');

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

(async () => {
  const {models} = await storage();

  const s = await models.State.findOne({name: 'pennsylvania'});
  

  let elections = await models.Election.getElections({
    year: 2022,
    state: 'pennsylvania'
  }, [{
    model: models.Candidacy,
    include: [{
      model: models.CampaignFinance
    }, {
      model: models.Candidate
    }]
  }]);

  console.log(elections.length, 'total elections');
  console.log(elections[0]);

  const elements = [];

  elections = elections.filter(x => {
    return x.type == 'general' && (x.Candidacies?.length ?? 0 > 1);
  }).sort((a,b) => {
    if(a.Office.District.Chamber.level < b.Office.District.Chamber.level) return -1;
    if(b.Office.District.Chamber.level < a.Office.District.Chamber.level) return 1;
    return a.Office.District.number - b.Office.District.number;
  });

  for(const election of elections) {
    const state = election.Office.District.Chamber.State.name;
    const year = election.year.toString();
    const type = election.type;
    const district = election.Office.District.number.toString();
    const chamber = election.Office.District.Chamber.name;
    // const level = election.Office.District.Chamber.level.toString();

    // elements.push({
    //   state,
    //   year,
    //   chamber,
    //   district,
    //   type,
    //   level,

    //   first_name:'',
    //   last_name:'',
    //   party:'',

    //   contributions: '',
    //   expenditures: ''
    // })

    for(const candidacy of election.Candidacies) {
      const {Candidate, CampaignFinance} = candidacy;
      elements.push({
        state,
        year,
        chamber,
        district,
        type,
        // level,
        first_name: Candidate.first_name,
        last_name: Candidate.last_name,
        party: Candidate.party,
        contributions: CampaignFinance?.contributions ?? '',
        expenditures: CampaignFinance?.expenditures ?? ''
      });
    }
    elements.push({});
  }
  
  // elements.forEach(x=>{delete x.level;});

  print(elements);
})();