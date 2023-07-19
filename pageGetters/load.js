

function CandidateWebsiteLoader(models){
    this.Webpage = models.Webpage;
}

CandidateWebsiteLoader.prototype.loadWebsiteResults = async function(results) {
    try{

        for await ( webpage_object of results){
            await this.Webpage.upsert({
                name: webpage_object.name, 
                fundraiser: webpage_object.fundraiser,
                website: webpage_object.website, 
                race: webpage_object.race,
                office: webpage_object.office
            })
        }
        
    } catch(e){
        throw new Error(`Failed to load webpage results:  ${e}`);
    }
}


module.exports = CandidateWebsiteLoader;