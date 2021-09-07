import React from 'react';
import { TLDRCard } from './tldr'
import {LongVersionCard} from './longVersionCard';
import {ButHowCard} from './butHow'

export function Explainer(){

  return (
    <div className="explainer">
      <h1>About Us</h1>
      <TLDRCard />
      <LongVersionCard />
      <ButHowCard />
    </div>
  )
}
