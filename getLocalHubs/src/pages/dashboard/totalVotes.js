import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';


const TotalVotes = ({ voteTotal}) =>{


  return (
    <AnalyticEcommerce title="Vote Total" count={String(voteTotal).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} percentage={100} />
  )

}

export default TotalVotes
