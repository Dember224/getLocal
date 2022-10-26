const census = require('citysdk');
const {Op} = require('sequelize');
const census_tools = require('./index')

const getStorage = require('../Storage');

function CensusDataLoader(models){
    this.District = models.District;
    this.State = models.State;
    this.Chamber = models.Chamber;
    this.CensusData = models.CensusData;
}

function chamberParser(value){
    if(value == 'upper' || value == 'senate') value = 1;
    if(value == 'lower' || value == 'house') value = 0;
    return value;
}
CensusDataLoader.prototype.loadCensusData = async function(results){
    for await (census_object of results){
        ({
            chamber,
            state,
            female_population,
            black_population,
            median_age,
            number_of_other_races,
            divorced_population,
            under_18_population,
            citizen_population,
            district,
            number_of_mixed_race_ppl,
            median_female_age,
            married_population,
            median_income,
            male_population,
            never_married_population,
            total_population,
            median_male_age,
            non_citizen_population,
            pacific_islander_population,
            latino_population,
            separated_marriage_population,
            asian_population,
            white_population,
            native_american_population,
            acs_source_path,
            acs_vintage
          } = census_object)
        const state_name = state.toLowerCase()
        const district_number = district;

        if(!district_number) continue; //lookup will break and exit without a district number

        console.log(state_name)
        const state_obj = await this.State.findOne({
            where: {
                name:state_name
            }
        })
        const state_id = state_obj.state_id
        const district_obj = await this.District.findOne({
            where: {
                number: district_number
            },
            include: [
                {
                    model: this.Chamber,
                    where: {
                        level: chamberParser(chamber),
                        state_id
                    }
                }
            ]
        })
        console.log(district_obj)
        if(!district_obj || !district_obj.district_id) continue; // if you can't find the district move on.

        const district_id = district_obj.district_id;

        await this.CensusData.findOrCreate({
            where: {
                chamber_id: district_obj.chamber_id,
                female_population,
                black_population,
                median_age,
                other_race_population: number_of_other_races,
                divorced_population,
                under_18_population,
                citizen_population,
                district_id,
                median_female_age,
                married_population,
                median_income,
                male_population,
                never_married_population,
                total_population,
                median_male_age,
                non_citizen_population,
                pacific_islander_population,
                latino_population,
                separated_marriage_population,
                asian_population,
                white_population,
                native_american_population,
                acs_source_path,
                acs_vintage
            }
        })

        
    }
    
};

//most recent census year for the acs5 is 2017
const downloadData = async function(year){
    const storage = await getStorage();

    const loader = new CensusDataLoader(storage.models)
    const census_data = await census_tools(year);

    await loader.loadCensusData(census_data)
}

module.exports = CensusDataLoader