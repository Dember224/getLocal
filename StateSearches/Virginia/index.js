const axios = require('axios');
const parsers = require('../../Tools/parsers');
const month_array = ['01', '02', '03', '04','05','06','07','08','09', '10','11','12'];

function getCurrentMonth(){
  const date = new Date();

  const current_month = date.getMonth();
  const useable_array = month_array.slice(0, current_month +1)
  return useable_array;
}


async function sleep(time) {
  console.log('sleeping',time);
  await new Promise((res,rej) => {
      setTimeout(res, time);
  });
}

function sortOffice(office_name){
  if(office_name.includes("Senate") || office_name.includes("Senator")){
    return "state senator";
  } else if (office_name.includes("Delegate") || office_name.includes("House")) {
    return "state delegate";
  } else{
    return "N/A"
  }
}

const getFinanceCSVPage = async function(callData){
  const response = await axios.get(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${callData.month}/Report.csv
  `)
  const results_array = await parsers.csvParser(response.data);

  const report_array = results_array.map(x=>{
    const office = x.OfficeSought ? x.OfficeSought : '' 
    const report_object = {
      name: x.CandidateName ? x.CandidateName.replace(/(Mr|MR|Ms|Miss|Mrs|Dr|Sir|Senator|Hon.|Rev.|Delegate)(\.?)\s/,"") : null,
      report_num:x.ReportUID,
      district:x.District ? parseInt(x.District.replace(/\D+/g, '')): null,
      party:x.Party === "Democratic" ? "Democrat" : x.Party,
      office:sortOffice(office),
      asOf: new Date(),
      year: callData.year,
      state: "Virginia",
      election_type:callData.election_type
    }
      return report_object
    })

  return report_array
}

const readScheduleHcsv = async function(callData){
  const response = await axios.get(`https://apps.elections.virginia.gov/SBE_CSV/CF/${callData.year}_${callData.month}/ScheduleH.csv`);

  const results = parsers.csvParser(response.data)

  const report_array = results.map(x=>{
    const report_object = {
      contributions: parseFloat(x.TotalReceiptsThisElectionCycle),
      expenditures:parseFloat(x.TotalDisbursements),
      report_id:x.ReportId,
      report_num: x.ReportUID
    }
    return report_object
  });

  return report_array
  
}

const getFinanceData = async function(callData){
  const final_array = []
  for await (month of getCurrentMonth()){
    await sleep((Math.random()) * 1000);
    const schedule_h = await readScheduleHcsv({year:callData.year, month, election_type:callData.election_type})
    const report = await getFinanceCSVPage({year:callData.year, month, election_type:callData.election_type})
    const combined_array = schedule_h.map(h_object =>{
      const match = report.find(report_object=>{
        return report_object.report_num === h_object.report_num
      });

      return {...h_object, ...match}


    });
    await final_array.push(combined_array)
  }

  const raw_array = final_array.flat(1)
  console.log(raw_array)
  const return_array = raw_array.filter(x=>{
    if(x.district && x.office && x.office != 'N/A'){
      return x;
    }
  })
  return_array.map(x=>{
    console.log(x)
  })
  return return_array;
}

// getFinanceData({year:2023, }).then((r)=>{
//   r.map(x=>{
//     console.log(x)
//   })
// })



module.exports = {
  getFinanceData
}