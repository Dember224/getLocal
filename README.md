# getLocal

Get Local is a Node.js based application intended to aggregate US Democrat's state level campaign finance data.

The FEC has one hub for accessing campaign finance data for any federal election. 
Find it here: https://www.fec.gov/data/ 
The API here: https://api.open.fec.gov/developers/

Unfortunately state level campaign finance data is strewn about 50 disparate loci. Typically, each state's secretary of state's office makes the data available in some format. 
For some states, sending a request to a rest API returns a JSON object with the data. Others allow for the export of a CSV or zipfile. Then there are those which render the data through a UI that must be scraped to retrieve it programmatically. 
Irrespective of how, Get Local does what needs to be done to retrieve the campaign finance totals. 

There are existing efforts to aggregate state campaign finance data but these tend to be carried out with the goal of transparency in mind. 
Get Local's purpose is to help its user's identify left leaning candidates at the state level, that may be short of funds, and direct money towards them. 
Enabling traditionaly under-represented people a means of overcoming the financial hardship associated with running for office is what this project is for. 

Currently, node scripts retrieve the totals then load it into a heroku postgres database. The next steps of the project are pending. 

Here is a years worth of data for the first 8 state's visualized: 
https://campaignbucs.grafana.net/dashboard/snapshot/YV6qJ4kmlJcbLa8Dtir08OurUSh3H9ik

For a peak at what we've got so far, see here: 
https://data.heroku.com/dataclips/lvfocubcptvffcmhumzyfziuguci
