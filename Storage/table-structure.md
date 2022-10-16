# Table Structure

### Candidate

Represent a person running for office

- candidate_id (integer auto_increment)
- first_name
- middle_name
- last_name
- party
- as_of (datetime)

- current_office_id

### Office

- office_id
- name
- district_id

### District

- district_id
- chamber_id
- state_id
- total_population
- eligible_voter_population
- ... census data

### State

- state_id
- name
- abbreviation
- chamber_count

### Chamber

- chamber_id
- state_id
- name
- level (upper, lower)

Potentially:
- spend / raise limit?

### Election

- election_id
- year
- date
- office
- type (primary,general,runoff)

### Primary Election (Extends Election)

- primary_election_id
- general_election_id
- party

### Runoff Election (Extends Election)

- runoff_election_id
- general_election_id

### Vote Count

- election_id
- candidate_id
- count

### Campaign Finance

- election_id - bigint
- candidate_id - bigint
- contributions - decimal (total $)
- expenditures - decimal (total $)

### Census Data

- district_id
- acs_source_path
- acs_vintage
- total_population
- male_population
- female_population
- median_age
- median_male_age
- median_female_age
- under_18_population
- white_population
- black_population
- native_american_population
- asian_population
- pacific_islander_population
- latino_population
- citizen_population
- non_citizen_population
- married_population
- never_married_population
- separated_marriage_population
- divorced_population
- median_income