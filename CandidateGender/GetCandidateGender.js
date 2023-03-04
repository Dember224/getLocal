const detect = require('detect-gender');
const getStorage = require('../Storage');
const {Op} = require('sequelize');


genderLookup = async function(first_name){
    const gender = await detect(first_name)
    return gender;
}

function GenderApproximationLoader(models) {
    this.Candidate = models.Candidate;
}

GenderApproximationLoader.prototype.loadGenerApproximations = async function(start_id, end_id) {
    try{
        const candidates = await this.Candidate.findAll({
            where: {
                candidate_id: {
                    [Op.between]: [start_id, end_id]
                }
            }
        })

        const mapped_candidates = candidates.map((candidate)=>{
            const candidate_object = {
                first_name: candidate.first_name,
                id: candidate.candidate_id
            }
            return candidate_object;
        });

        const gender_array = []

        for await (const candidate of mapped_candidates){
            const gender = await genderLookup(candidate.first_name)
            candidate.gender = gender;
            console.log(gender)

            const new_candidate = await this.Candidate.update({
                gender_approximation: gender
            },
            {
                where: {
                    candidate_id: [candidate.id]
                }
            })

            console.log(`Uploaded: ${new_candidate}`)

            gender_array.push(candidate);
        }
        return gender_array



    } catch(e){
        console.log(e);
    }



}


async function checkCandidateGender(){
    try{
        const storage = await getStorage();
        const loader = new GenderApproximationLoader(storage.models);
        await loader.loadGenerApproximations(2572, 3509)


    }catch(e){
        console.log(e)
    }
}

checkCandidateGender()

// (async function(){
//     console.log(await genderLookup("Erica"))
// })()





