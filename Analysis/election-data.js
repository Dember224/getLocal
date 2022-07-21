function CampaignAnalysis(params) {
    const {models}=params;

    this.State = models.State;
}

CampaignAnalysis.prototype.getCurrentElectionInfo = async function(params) {
    // const {year,state} = params;
    
    const state = await this.State.findOne({name: params.state});
}

module.exports = CampaignAnalysis;
