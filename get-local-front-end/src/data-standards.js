import React from 'react';
import {StandardizationCard} from './standardizationCard';
import {ElectionTypeCard} from './electionTypes'
import {ElectionDatesCard} from './electionDates'
import {InclusionCard} from './inclusionCard'


export function StandardizationExplanation() {

  return (
    <div className="explainer">
      <StandardizationCard />
      <ElectionTypeCard />
      <ElectionDatesCard />
      <InclusionCard />
    </div>
  )
}
