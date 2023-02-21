const detect = require('detect-gender');
const getStorage = require('../Storage');

genderLookup = async function(first_name){
    const gender = await detect(first_name)
    return gender;
}

function genderApproximationLoader(models) {
    this.Candidate = models.Candidate; 
}

genderApproximationLoader.prototype.loadGenerApproximations = async function(start_id, end_id) {
    try{
        const candidate = await this.Candidate.findAll({
            where: {
                candidate_id: {
                    [Op.between]: [start_id, end_id]
                }
            }
        })



    } catch(e){
        console.log(e);
    }



}





