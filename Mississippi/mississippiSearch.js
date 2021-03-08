const crawler = require('crawler-request');

const checkPDF = function(callData){
  crawler(`https://www.sos.ms.gov/Elections-Voting/Documents/QualifyingForms/${callData.year}%20Candidate%20Qualifying%20List.pdf`).then(function(response){
    const response_array = response.text.split('\n')
    const just_the_democrats = response_array.map(x=>{
      if(x.includes('Democratic')){
        if(x.includes('Representative') || x.includes('Senate')){
          return x.split("State");
        }

      }
    }).filter(function(x) {
      return x !== undefined;
    });

    const candidate_object = just_the_democrats.map(x=>{
      const district = x[1].replace(/\D/g, "")
      const candidate_details = {
        name: x[0],
        office:x[1].includes('Senate')?'Senate':'Representative',
        district,
        year:callData.year
      }
      return candidate_details;
    })

    console.log(candidate_object)
  })
}

checkPDF({year:2019})
