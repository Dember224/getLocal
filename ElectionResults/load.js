const {Op}=require('sequelize');
const {parseFullName} = require('parse-full-name');

function ElectionResultsLoader(models) {
    this.Election = models.Election;
    this.Chamber = models.Chamber;
    this.District = models.District;
    this.Office = models.Office;
    this.Candidate = models.Candidate;
    this.Candidacy = models.Candidacy;
    this.State = models.State;
}

function getChamberLevel(level) {
    const save = level;

    if(level == 0 || level == 1) return level;

    level = level.toLowerCase();

    if(level == 'house' || level == 'lower') return 0;
    if(level == 'senate' || level == 'upper') return 1;

    throw new Error("Failed to determine level from "+JSON.stringify(save));
}
ElectionResultsLoader.prototype.loadElectionResults = async function(results) {
    for(const election of results) {
        // let {
        //     year,
        //     special,
        //     general,
        //     democratic_primary=[],
        //     republican_primary=[],
        //     state,
        //     level,
        //     district,
        //     date
        // } = election;

        console.log("Looking up",election.state,election.chamber);
        const stateName = election.state
        const state = await this.State.findOne({
            where: {
                name: election.state
            }
        });
        const chamber = await this.Chamber.findOne({
            where: {
                state_id: state.state_id,
                level: getChamberLevel(election.level)
            }
        });
        if(!state || !chamber) throw new Error("Failed to find state or chamber");

        const [{district_id},] = await this.District.findOrCreate({
            where: {
                chamber_id: chamber.chamber_id,
                number: election.district
            },
            defaults: {
                chamber_id: chamber.chamber_id,
                number: election.district,
                name: `District ${election.district}`
            }
        });
        const [{office_id},] = await this.Office.findOrCreate({
            where: {
                district_id
            }
        });

        const {year, general_date} = election;
        if(!general_date) throw new Error('General Date Missing');
        const [generalElection] = await this.Election.findOrCreate({
            where: {
                year,
                date: general_date,
                type: 'general',
                office_id
            }
        });

        const candidates = [];
        election.general?.map(candidate => {
            const {candidate_name, votes, party='independent'} = candidate;
            if(!party) {
                console.log(JSON.stringify(election, null, 2), '\n', JSON.stringify(candidate,null,2));
                throw new Error("Missing party from general election candidate");
            }
            const parsedName = parseFullName(candidate_name);
            candidates.push({
                first_name: parsedName.first,
                middle_name: parsedName.middle,
                last_name: parsedName.last,
                votes,
                party,
                election_id: generalElection.election_id
            });
        });

        const handlePrimary = async (primaryCandidates,primaryDate,primaryParty) => {
            if(primaryCandidates?.length) {
                const [primary] = await this.Election.findOrCreate({
                    where: {
                        year,
                        type: 'primary',
                        party: primaryParty,
                        date: primaryDate,
                        office_id,
                        general_election_id: generalElection.election_id
                    }
                });
                for(let candidate of primaryCandidates) {
                    const {candidate_name, votes} = candidate;
                    const parsedName = parseFullName(candidate_name);
                    candidates.push({
                        first_name: parsedName.first,
                        middle_name: parsedName.middle,
                        last_name: parsedName.last,
                        votes,
                        party: primaryParty,
                        election_id: primary.election_id
                    });
                }
            }
        };

        const {
            democratic_primary,
            democratic_primary_date,
            republican_primary,
            republican_primary_date
        } = election;
        handlePrimary(democratic_primary, democratic_primary_date, 'democratic');
        handlePrimary(republican_primary, republican_primary_date, 'republican');

        for(let candidate of candidates) {
            const {
                first_name,
                middle_name,
                last_name,
                party,
                election_id,
                votes
            } = candidate;
            const [{candidate_id}] = await this.Candidate.findOrCreate({
                where: {
                    first_name,
                    middle_name,
                    last_name,
                    state_id: state.state_id,
                    party
                }
            });

            const [candidacy] = await this.Candidacy.findOrCreate({
                where: {
                    election_id,
                    candidate_id
                }
            });            
            if(votes > 0) {
                candidacy.votes = votes;
                await candidacy.save();
            }
        }
    }
}

module.exports = ElectionResultsLoader;