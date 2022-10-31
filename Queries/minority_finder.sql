Select distinct (cd.black_population::float/cd.total_population::float)*100 as black_percentage, 
cd.total_population::float - cd.under_18_population::float as eligible_voters,
cd.district_id,
cd.chamber_id,
d.name as district,
s.name as state,
c.name as chamber,
e.type,
cc.votes,
ca.first_name,
ca.last_name,
ca.party
from "CensusData" cd
inner join "Districts" d
on d.district_id = cd.district_id
inner join "Chambers" c
on cd.chamber_id = c.chamber_id
inner join "States" s
on s.state_id = c.state_id
inner join "Offices" o
on o.district_id=d.district_id
and o.district_id = cd.district_id
inner join "Elections" e
on e.office_id=o.office_id
and e.year=2022
and e.type='general'
inner join "Candidacies" cc
on cc.election_id=e.election_id
inner join "Candidates" ca
on ca.candidate_id = cc.candidate_id
order by black_percentage desc
limit 150; 