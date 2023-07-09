const data = `Select 
distinct
cs.candidacy_id,
cs.candidate_id,
cs.first_name,
cs.middle_name,
cs.last_name,
cs.party,
cs.state_name,
cs.district,
cs.year, 
cs.election_type,
cf.expenditures, 
cf.contributions,
ch.name as "chamber",
cd.acs_vintage,
cd.acs_source_path,
cd.total_population,
cd.male_population,
cd.female_population,
cd.median_age,
cd.median_male_age,
cd.median_female_age,
cd.under_18_population,
cd.white_population,
cd.black_population, 
cd.native_american_population, 
cd.asian_population, 
cd.latino_population, 
cd.pacific_islander_population, 
cd.citizen_population,
cd.non_citizen_population,
cd.married_population, 
cd.never_married_population, 
cd.separated_marriage_population, 
cd.divorced_population,
cd.median_income,
cd.other_race_population
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


order by cs.last_name ;`;

module.exports = data;