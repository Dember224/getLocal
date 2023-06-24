const {Op}=require('sequelize');
const {parseFullName} = require('parse-full-name');
const sequelize = require('sequelize');

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

      // console.log(cols.join(' | '));
  });
}

function CampaignFinanceLoader(models){
  this.CampaignFinance = models.CampaignFinance;
  this.Candidate = models.Candidate;
  this.Candidacy = models.Candidacy;
  this.Chamber = models.Chamber;
  this.State = models.State;
  this.District = models.District;
  this.Election = models.Election;
  this.Office = models.Office;
  this.CandidateSearch = models.CandidateSearch;
}

async function searchDistrictByName(){

}

function ProcessLevel(office){
  let level = office.toLowerCase();
  if(level.includes('house') || level.includes('lower') || level.includes('rep') || level.includes('assembly') || level.includes('delegate')) {
    return 0;
  } else if(level.includes('senat') || level.includes('upper')){
    return 1;
  } else {
    return null;
  }
}

CampaignFinanceLoader.prototype.loadCampaignFinances = async function(finance_array) {
  try{
    const state_name = finance_array[0].state.toLowerCase();

    const noMatch = [];
  
    for(const finance_object of finance_array) {
      const candidate_full_name = finance_object.name;
      let party = `${finance_object.party}`
      party = party.toLowerCase()  == 'democrat' ? 'democratic' : party.toLowerCase() ;
  
      const parsedName = parseFullName(candidate_full_name);
  
      const election_date = new Date(finance_object.election_year);
      const election_year = finance_object.year ?? election_date.getFullYear();
  
      const first_name = parsedName.first.toLowerCase();
      const last_name = parsedName.last.toLowerCase();
  
      let level = ProcessLevel(finance_object.office)
      const where = {
        first_name:parsedName.first.toLowerCase(),
        last_name:parsedName.last.toLowerCase(),
        // party:party,
        state_name,
        district:finance_object.district ? finance_object.district : null,
        chamber_level:level,
        year: election_year,
        election_type: finance_object.election_type.toLowerCase()
      };
  
      const state = await this.State.findOne({
        where: {
          name: state_name
        }
      });
      if(!state) throw new Error('invalid state: '+state_name);
      const chamber = await this.Chamber.findOne({
        where: {
          state_id: state.state_id,
          level
        }
      });
      if(!chamber) throw new Error('invalid chamber: '+level);
      let district = await this.District.findOne({
        where: {
          chamber_id: chamber.chamber_id,
          number: where.district
        }
      });
       if(!district){
        const cs = await this.CandidateSearch.findOne({
          where:{
            first_name: parsedName.first.toLowerCase().trim(),
            last_name: parsedName.last.toLowerCase().trim(),
            year: finance_object.year,
            state_name: finance_object.state
          }
        }) //if the finance lookup couldn't find a district number. Look up the district from the Candidate Search view using names, state, and year.
        if(!cs)continue;
        const district_number = cs.district;
        const chamber_id = chamber.chamber_id;

        district = await this.District.findOne({
          where:{
            number: district_number,
            chamber_id: chamber_id
          }
        })


         //throw new Error('invalid district');
       }   //Just skip it if we can't find the district for now. 

      const office = await this.Office.findOne({
        where: {
          district_id: district.district_id
        }
      });
      if(!office) throw new Error('invalid office');
      const election = await this.Election.findOne({
        where: {
          office_id: office.office_id,
          year: election_year
        }
      });
  
      // sequelize.where(sequelize.fn('LOWER', sequelize.col('firstname')), 'LIKE', '%' + search.toLowerCase() + '%')
  
      const candidates = await this.Candidate.findAll({
        where: {
          first_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('first_name')), Op.eq, first_name.toLowerCase()),
          last_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('last_name')), Op.eq, last_name.toLowerCase())
        }
      });
      if(!candidates.length) {
        console.log('no candidates found for: ',parsedName, candidates);
        noMatch.push({...finance_object, first_name, last_name});
      } else {
        if(!election) {
          console.log('Fed null on election.') 
          continue;
        } //skip it if we've been feed a null object
        const candidacies = await this.Candidacy.findAll({
          where: {
            election_id: election.election_id,
            candidate_id: {
              [Op.in]: candidates.map(x=>x.candidate_id)
            }
          }
        });
  
        let [candidacy] = [...candidacies].sort((a,b) => {
          if(a.election_type == 'general') return -1;
          if(b.election_type == 'general') return 1;
          
          return -1;
        });
  
        if(candidacy) {
          console.log('found it!', candidacy);
          const contributions = finance_object.contributions ?? null;
          const expenditures = finance_object.expenditures ?? null;
  
          const finance = await this.CampaignFinance.findOrCreate({
            where: {
              candidacy_id: candidacy.candidacy_id,
            },
            defaults:{
              contributions: contributions,
              expenditures:expenditures
            }
          }); //updating campaign finance data if it exists.
          
          if(finance.candidacy_id){
            await this.CampaignFinance.update({
              expenditures: expenditures,
              contributions: contributions
            }, 
            {
              where: {
                candidacy_id: finance.candidacy_id
              }
            })
          }
          
        }
      }
  
  
    }

  
  } catch(e){
    console.log('Error in the finance load file', e)
  }


}

module.exports = CampaignFinanceLoader
