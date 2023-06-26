const data = `Select Distinct cs.state_name, cs.year 
from "CandidateSearch" cs 
inner join "CampaignFinances" cf
on cf.candidacy_id = cs.candidacy_id
and cf.contributions is not null
order by cs.state_name, cs.year`;

module.exports = data;