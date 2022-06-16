With all_votes_cte as (Select
c.first_name,
c.last_name,
c.party,
cd.votes,
cd.election_id,
e.year,
e.general_election_id,
o.office_id,
d.name as district,
ch.name as chamber

from "Candidates" c
inner join "Candidacies" cd
on cd.candidate_id = c.candidate_id
inner join "Elections" e
on e.election_id = cd.election_id
and e.general_election_id is not Null
and e.year = 2020
inner join "Offices" o
on o.office_id = e.office_id
inner join "Districts" d
on d.district_id = o.district_id
inner join "Chambers" ch
on ch.chamber_id = d.chamber_id
where c.state_id = 42

order by d.name ),

winner_votes as (
Select
max(a.votes) as votes,
e.general_election_id

from "Elections" e

inner join all_votes_cte a
on a.general_election_id = e.general_election_id

group by e.general_election_id
)

select a.first_name,
a.last_name,
a.party,
w.votes,
a.district,
a.chamber

from all_votes_cte a

inner join winner_votes w
on w.general_election_id = a.general_election_id
and w.votes = a.votes

order by a.district
