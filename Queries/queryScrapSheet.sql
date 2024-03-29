select state, sum(contributions), sum(expenditures) from campaign_finance where year = '2020-01-01 00:00:00' group by state

select state, avg(contributions) as contributions, avg(expenditures) as expenditures from campaign_finance group by state where contributions is not null and expenditures is not null and expenditures != 'NaN' and contributions != 'NaN' group by state

select count(case when expenditures = 0 then 1 else 0 end) as '0 expenditures', count(case when expenditures >0 and expenditures < 1000 then 1 else 0 end ) as '0 to 1,000$ spent', count(case when expenditures >1000 and expenditures < 10000 then 1 else 0 end ) as '1,000 to 10,000$ spent',
count(case when expenditures >10000 and expenditures < 50000 then 1 else 0 end ) as '10000 to 50,000$ spent', count(case when expenditures >50000 and expenditures < 100000 then 1 else 0 end ) as '50,000 to 100,000$ spent', count(case when expenditures >100000 and expenditures < 500000 then 1 else 0 end ) as '100,000 to 500,000$ spent',
count(case when expenditures >500000 and expenditures < 1000000 then 1 else 0 end ) as '500,000 to 1,000,000$ spent',count(case when expenditures >1000000 then 1 else 0 end ) as '1,000,000$ plus spent', count(case when contributions = 0 then 1 else 0 end) as '0$ contributions',
count(case when contributions >0 and contributions < 1000 then 1 else 0 end ) as '0 to 1,000$ contributed', count(case when contributions >1000 and contributions < 10000 then 1 else 0 end ) as '1,000 to 10,000$ contributed',
count(case when contributions >10000 and contributions < 50000 then 1 else 0 end ) as '10000 to 50,000$ contributed', count(case when contributions >50000 and contributions < 100000 then 1 else 0 end ) as '50,000 to 100,000$ contributed', count(case when contributions >100000 and contributions < 500000 then 1 else 0 end ) as '100,000 to 500,000$ contributed',
count(case when contributions >500000 and contributions < 1000000 then 1 else 0 end ) as '500,000 to 1,000,000$ contributed',count(case when contributions >1000000 then 1 else 0 end ) as '1,000,000$ plus contributed' from campaign_finance where contributions is not null and expenditures is not null and contributions != 'NaN' and expenditures != 'NaN'


Select * from campaign_finance



Delete from campaign_finance a
using campaign_finance b
where a.name_year = b.name_year
