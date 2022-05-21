const states = require('./states-fips.json');
const usa = require('usa-state-legislatures');
const filled = states.map(x => {
    try {
        const {
            legislatureName,
            upperHouse,
            lowerHouse
        } = usa.stateLegislatures.stateLegislatureName(x.name);

        const chambers = [];
        if(upperHouse != 'N/A') chambers.push({
            chamber_id: x.state_id*2,
            level: 'upper',
            name: upperHouse
        });
        if(lowerHouse != 'N/A') chambers.push({
            chamber_id: x.state_id*2+1,
            level: 'lower',
            name: lowerHouse
        });

        return {
            ...x,
            chambers
        };
    } catch(e) {
        return x;
    }
});
console.log(JSON.stringify(filled,null,2));