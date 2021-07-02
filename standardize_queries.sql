UPDATE campaign_finance set office = Lower(office) where state = 'Texas';

Update campaign_finance set Election_year = to_date(Election_year::varchar, 'yyyy');

ALTER TABLE campaign_finance ALTER COLUMN Election_year TYPE timestamp Using to_timestamp(Election_year::varchar, 'yyyy');
