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
