const stateSearches = require('./StateSearches');
const DataAccess = require('./ApiV2/dataAccessLayer');
const {parseFullName} = require('parse-full-name');
const theSuperDeDuper = require('./Tools/dedupe');


class EfficacyChecker {
    constructor(state, year){
        this.state = state;
        this.year = year;
    }

    async getStateFinanceData(){
        const callData = {
            state: this.state,
            year: this.year,
            election_type: 'general'
        }
        try{
           const result = await stateSearches[this.state]['getFinanceData'](callData, async(e,r)=>{
                try{
                    return await r;
                }catch(e){
                    throw new Error("Error retrieving finance results message: "+ e);
                }
            });
            const name_list = result.map(finance_object=>{
                return parseFullName(finance_object.name);
            });
            return name_list;
        } catch(e){
            throw new Error("Error retrieving finance results message: "+ e)
        }
    }

    async getAcquiredData(){
        try{
            const data = new DataAccess();
            const query = `Select first_name, last_name from "CandidateSearch" cs 
            where cs.state_name = :state
            and cs.year = :year`;
            const arg_object = {
                state: this.state,
                year: this.year
            }
            const candidate_list = await data.runQuery(query, arg_object);
            return candidate_list


        } catch(e){
            throw new Error("Failure to retrieve getLocal Data error: " +e);
        }
        
    }

    async candidateMatrix(){
        const finance_data = await this.getStateFinanceData();
        const our_data = await this.getAcquiredData();
        const our_data_length = our_data.length;
        let finance_data_missing = 0;
        let their_total_data = 0
        const de_duped = theSuperDeDuper(finance_data);



        const acquired_data = our_data.map(candidates_we_have=>{
            const first_name = candidates_we_have.first_name.toLowerCase().trim();
            const last_name = candidates_we_have.last_name.toLowerCase().trim();

            const match = de_duped.find(name_object=>{
                if(first_name == name_object.first.toLowerCase().trim() && last_name == name_object.last.toLowerCase().trim() && !name_object.error.length){
                    return name_object;
                }
                
            });
            
            if(match){
                return match;
            } else{
                finance_data_missing ++;
            }
        }).filter(x=>{
            if(x) return x;
        });
        console.table(acquired_data)

        const acquired_data_length = acquired_data.length;

        console.group(`${acquired_data_length}/${our_data_length} of our records found in finance object.`)

        console.log(`Finance data retrieval missing ${finance_data_missing} records`)

        const their_data =  de_duped.map(finance_names=>{
            const first_name = finance_names.first.toLowerCase().trim();
            const last_name = finance_names.last.toLowerCase().trim();

            const match =our_data.find(name_object=>{
                if(first_name == name_object.first_name.toLowerCase().trim() && last_name == name_object.last_name.toLowerCase().trim() ){
                    return name_object;
                }
            })
            their_total_data++

            if(match){
                return match;
            } 
        }).filter(x=>{
            if(x) return x;
        })

        console.log(`We have ${their_data.length}/${their_total_data} of the records present in the finance object.`)


    }
}

const efficacy = new EfficacyChecker('virginia', 2023);

efficacy.candidateMatrix()