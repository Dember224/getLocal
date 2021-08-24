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
Enabling traditionally under-represented people a means of overcoming the financial hardship associated with running for office is what this project is for.

Currently, node scripts retrieve the totals then load it into a heroku postgres database. The next steps of the project are pending.

Here is a years worth of data for the first 8 state's visualized:
https://campaignbucs.grafana.net/dashboard/snapshot/YV6qJ4kmlJcbLa8Dtir08OurUSh3H9ik

For a peak at what we've got so far, see here:
https://data.heroku.com/dataclips/lvfocubcptvffcmhumzyfziuguci

## Standardization

Each state conducts its own elections with what seems like minimal coordination with the others. The laws are different, the reporting deadlines are different, the election years are different, and states disseminate the data to we the people, differently. This poses a problem for doing any comparative analysis. Trade-offs must be made. If one state reports finance totals by date range, while another provides a summary of totals at the time a few reporting deadlines, how do we compare these? How would we compare the fundraising environments for an off year election like 2019, to that of a general, or midterm election year, such as 2016 or 2018 respectively?

Get Local operates on a set of standard practices that despite their imperfections, offer consistency. See some of those standards here:

### Election Types

Ultimately the goal is to win general elections, but upstream of that is who can compete in the primaries. For states who report totals by race, different candidates end their campaigns at different points throughout the race. In these states, if a candidate reports having terminated before the general, or is defeated in a primary, we acquire the totals for the latest reported date.
For candidates who made it to the general election, we use the report detailing the data that is most proximate to the election date. Some states, for example, might have a pre-election summary report.

Moving forward, Get Local will have a strong preference towards acquiring primary election totals, as those are the most underfunded, and represent the candidates with the highest need.

### Election Dates

When reporting systems generate totals based on a date range inputed by their users we must decide which dates we'd like to use. Campaigns can declare on different dates, depending on state laws. So which start date to use for a standardized download becomes ambiguous. We could acquire the start date of each campaign but that could be anywhere from simple to onerous.

The end date poses similar issues. One might think it obvious to use election day as a hard stop, but what of campaigns that are terminated prior to that? What of the financial activity that a campaign continues to undergo subsequent to its termination, victory, or defeat? This information is pertinent because it speaks to whether or not a middle class or poor candidate is taking on large amounts of campaign debt.

There is no perfect solution here, so for now, Get Local acquires data from the first day of an election year, to the last.

## Inclusion

Which types of money should be included in the totals furnished to the end user? If I'm looking at contributions, should this total be inclusive of in-kind contributions? Given that a state's UI might report a "total" under a contribution header and not make it clear what this total entails, and another state might explicitly report out in-kind contributions separately, this can get a bit tricky if you're trying to determine if you should give to candidates in one state as opposed to another. If the totals don't reflect the same thing your comparisons won't be apples to apple.

In general we include in-kind contributions to our totals. We want our numbers to reflect all types of largesse. We are therefore trusting the state's or individual's assessment of the value of an in-kind contribution. Not ideal, but too onerous to evaluate for ourselves.

Our numbers do not reflect loan totals. Again, we are trying to reflect largesse. A candidate incurring debt is not in keeping with this goal. If our project can assuage financial fears that underfinanced parties have about running for office we'd prefer to point potential contributors in their direction.

## Using Get Local

For now, the modules for getting the data can be run locally using Node. Just download and run NPM install and run the methods get methods through your terminal. Loading the information to a database takes setting up and configuring a DB. More practical ways of using this repository will take some time. In the meantime, the links above are the public facing aspects of Get Local.
