const data = `Select 
cs.*, 
cf.expenditures, 
cf.contributions,
ch.name as "chamber",
cd.*
from "States" s

inner join "CandidateSearch" cs
on s.name = cs.state_name
and s.name = :state
and cs.year = :year

inner join "CampaignFinances" cf 
on cf.candidacy_id = cs.candidacy_id 


inner join "Chambers" ch 
on ch.level = cs.chamber_level
and s.state_id = ch.state_id

inner join "Districts" d
on d.chamber_id = ch.chamber_id
and d.number = cs.district

inner join "CensusData" cd
on cd.district_id = d.district_id


order by cs.last_name `;

module.exports = data;