

const getElectionDate = function(year){
  const dates = {
    2022:'20221108',
    2020: '20201103',
    2018:'20181106',
    2016:'20161108',
    2014:'20141104'
  }
  return dates[year];
}

module.exports = {
  getElectionDate
}
