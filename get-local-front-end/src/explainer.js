import React from 'react';

export function Explainer(){

  return (
    <div className="explainer">
      <h1>About Us</h1>
      <h2 style={{display:"inline-block"}}>TLDR</h2>
      <p style={{display:"inline-block"}}>Get Local is a platform for aggregating state level campaign finance data in order to better target money towards down ballot democrats.</p>
      <h2>The Long Version</h2>
      <p style={{"text-align":"center"}}>
        Running for office in the United States can be prohibitvely expensive. Many state level campaigns spend tens, hundreds of thousands, or millions of dollars.
        Imagine being a teacher, janitor, or nurse with aspirations to represent your community, only to be dissuaded by the price tag.
        Our system, as presently constituted, paves paths to power for independently wealthy, or well connected individuals, while discouraging all others with the potential for immizeration and insolvency after failed, or even successful races.
        Get Local is an effort to, in some small way, assuage poor to middle class financial anxieties about running for office.
      </p>
      <h4>But How?</h4>
      <p>
        Our approach is to collect campaign finance data from all 50 states in a way that enables comparative analysis. We are aware of aggregating efforts for the sake of transparency, but none that are designed with idea of helping people find and support the most in-need campaigns. We standardize data as best we can so that you, the end user, can decide between helping a waiter in San Diego and an engineer in Arizona.
      </p>
    </div>
  )
}
