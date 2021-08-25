import React from 'react';

export function StandardizationExplanation() {

  return (
    <div className="explainer">
      <h1>
        Standardization
      </h1>
      <p>
        Comparing the needs of candidates accross states poses challenges that require sacrifices.
        We have 50 states running their own elections in disparate ways.
        Some states set their contribution  limits relatively low, while others have no contribution limits at all.
        Even the dissemination of the data is different between states. One may produce reports with contribution totals due by a specific reporting deadline while other interfaces render totals between 2 dates chosen by the user.
        How are we to compare finance of 2 campaings in states with different election laws so that you can determine which most needs your support? Unfortunately there is no perfect solution and trade-offs are necessary.
        The following are the decisions we've made on how to collect contribution and expenditure totals.
      </p>
      <h2>
        Election Types
      </h2>
      <p>
        Ultimately the goal is to win general elections, but upstream of that is who can compete in the primaries. For states who report totals by race, different candidates end their campaigns at different points throughout the race. In these states, if a candidate reports having terminated before the general, or is defeated in a primary, we acquire the totals for the latest reported date.
        For candidates who made it to the general election, we use the report detailing the data that is most proximate to the election date. Some states, for example, might have a pre-election summary report.
      </p>
      <p>
        Moving forward, Get Local will have a strong preference towards acquiring primary election totals, as campaigns that don't make it to the general are typically the most underfunded, and represent the candidates with the highest need. If our resources expand we will revisit data collection for special elections, run-offs, general elections, etc.
      </p>
      <h2>
        Election Dates
      </h2>
      <p>
        When reporting systems generate totals based on a date range inputed by their users we must decide which dates we'd like to use. Campaigns can declare on different dates, depending on state laws. So which start date to use for a standardized download becomes a sticky wicket.
        We could acquire the declaration date of each campaign but that could be anywhere from simple to onerous, varying by state.
      </p>
      <p>
        The end date poses similar issues.
        One might think it obvious to use election day as a hard stop, but what of campaigns that are terminated prior to that?
        What of the financial activity that a campaign continues to undergo subsequent to its termination, victory, or defeat?
        This information is pertinent because it speaks to whether or not a middle class or poor candidate is taking on large amounts of campaign debt and/or successfully repaying it.
      </p>
      <p>
        There is no perfect solution here, so for now, Get Local acquires data from the first day of an election year, to the last.
        The hope is that the 11 months leading up to a General election will be inclusive of most primary and general election activity, while also reflecting post-campaign activity.
      </p>
      <h2>
        Inclusion
      </h2>
      <p>
        Which types of money should be included in the totals furnished to the end user?
        If I'm looking at contributions, should this total be inclusive of in-kind contributions?
        Given that a state's UI might report a "total" under a contribution header and not make it clear what this total entails, and another state might explicitly report out in-kind contributions separately, this can get a bit tricky.
        If the totals don't reflect the same thing your comparisons won't be apples to apple.
      </p>
      <p>
        In general we include in-kind contributions to our totals.
        We want our numbers to reflect all types of largesse.
        We are therefore trusting the state's or individual's assessment of the value of an in-kind contribution.
        Not ideal, but too onerous to evaluate for ourselves.
      </p>
      <p>
        Our numbers do not reflect loan totals. Again, we are trying to reflect largesse. A candidate incurring debt is not in keeping with this goal.
        If our project can assuage financial fears that underfinanced parties have about running for office we'd prefer to point potential contributors in their direction.
      </p>
    </div>
  )
}
