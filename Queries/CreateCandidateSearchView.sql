Create View CandidateSearch as
Select
c.candidacy_id,
c.candidate_id,
cd.first_name,
cd.middle_name,
cd.last_name,
cd.party,
s.name as state_name,
d.number as district,
ch.level as chamber_level,
e.year,
e.type as election_type
from "Candidacies" c
left join "Candidates" cd
on cd.candidate_id = c.candidate_id
left join "Elections" e
on e.election_id = c.election_id
left join "Offices" o
on e.office_id = o.office_id
left join "Districts" d
on d.district_id = o.district_id
left Join "Chambers" ch
on ch.chamber_id = d.chamber_id
left Join "States" s
on s.state_id = ch.state_id
