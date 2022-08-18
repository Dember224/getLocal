import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';


const DemVoteShare = ({ lastDemVotes, vote_percentage}) =>{


  return (
    <AnalyticEcommerce title="Previous Democrat Votes" count={String(lastDemVotes).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} percentage={vote_percentage.toFixed(2)} />
  )

}

export default DemVoteShare
