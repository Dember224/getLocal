with general_sample as (

	Select 
distinct
cs.candidacy_id,
cc.votes,
cf.contributions, 
cf.expenditures,
CASE
WHEN c.gender_approximation = 'male'
THEN 0
ELSE  1
END 
AS gender,
cd.total_population,
cd.male_population,
cd.female_population,
cd.under_18_population,
cd.white_population,
cd.black_population,
cd.latino_population,
cd.non_citizen_population,
cd.median_income

from "CandidateSearch" cs 

inner join "CampaignFinances" cf
on cf.candidacy_id = cs.candidacy_id
and cf.expenditures is not null 
and cf.contributions is not null 

inner join "Candidates" c
on c.candidate_id = cs.candidate_id
and c.gender_approximation is not null

inner join "States" s
on s.name = cs.state_name

inner join "Chambers" ch
on ch.level = cs.chamber_level
and ch.state_id = s.state_id

inner join "Districts" d
on d.number = cs.district
and ch.chamber_id = d.chamber_id

inner join "CensusData" cd
on cd.district_id = d.district_id
and cd.total_population is not null 
and cd.male_population is not null 
and cd.female_population is not null 
and cd.under_18_population is not null 
and cd.white_population is not null 
and cd.black_population is not null 
and cd.latino_population is not null 
and cd.non_citizen_population is not null 
and cd.median_income is not null 

inner join "Candidacies" cc
on cc.candidacy_id = cs.candidacy_id
and cc.votes is not null

limit 150

)

Select 
stddev(g.votes) as vote_sd,
stddev(g.contributions) as contribution_sd,
stddev(g.expenditures) as expenditure_sd,
stddev(g.gender) as gender_sd,
stddev(g.total_population) as population_sd,
stddev(g.male_population) as m_population_sd,
stddev(g.female_population) as f_population_sd,
stddev(g.under_18_population) as under_18_population_sd,
stddev(g.white_population) as white_population_sd,
stddev(g.black_population) as black_population_sd,
stddev(g.latino_population) as latino_population_sd,
stddev(g.non_citizen_population) as non_citizen_population_sd,
stddev(g.median_income) as median_income_sd


from general_sample g
