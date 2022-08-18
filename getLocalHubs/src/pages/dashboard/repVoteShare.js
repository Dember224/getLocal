import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';



const RepVoteShare = ({lastRepVotes, votePercentage}) =>{


  return (
    <AnalyticEcommerce title="Previous Republican Votes" count={String(lastRepVotes).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} percentage={votePercentage.toFixed(2)}  />
  )

}

export default RepVoteShare
