const { Sequelize, Model, DataTypes } = require('sequelize');
require('dotenv').config()
const db_password = process.env.DB_PASSWORD

const statesJson = require('./states.json');
statesJson.forEach(x => {
    x.name = x.name.toLowerCase();
})

async function getModels() {
  const db_url = process.env.DB_URL;
    const sequelize = new Sequelize(`postgres://postgres:${db_password}@localhost:5432/postgres`);

    const State = sequelize.define("State", {
        state_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: DataTypes.STRING,
        abbreviation: DataTypes.STRING
    }, {
        timestamps: false
    });
    await State.sync();
    await State.bulkCreate(statesJson, {
        ignoreDuplicates: true
    });

    const Chamber = sequelize.define("Chamber", {
        chamber_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        state_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: State,
                key: 'state_id'
            }
        },
        name: DataTypes.STRING,
        level: {
            type: DataTypes.INTEGER,
            validate: {
                isIn: [[0,1]]
            },
            allowNull: false,
            set(value) {
                if(typeof value == 'string') value = value.toLowerCase();
                if(value == 'upper' || value == 'senate') value = 1;
                if(value == 'lower' || value == 'house') value = 0;
                this.setDataValue('level', value);
            }
        }
    }, {
        timestamps: false
    });
    const chambers = [];
    statesJson.forEach(x => {
        x?.chambers?.forEach(c => {
            c = {...c};
            c.state_id = x.state_id;
            chambers.push(c);
            if(c.level == 'upper') c.level = 1;
            else c.level = 0;
        });
    });
    await Chamber.sync();
    await Chamber.bulkCreate(chambers, {
        ignoreDuplicates: true
    });

    const District = sequelize.define("District", {
        district_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        chamber_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Chamber,
                key: 'chamber_id'
            },
            allowNull: false
        },
        name: DataTypes.STRING,
        number: DataTypes.INTEGER,

        total_population: DataTypes.INTEGER,
        eligible_voter_population: DataTypes.INTEGER
    });

    const Office = sequelize.define("Office", {
        office_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING,
        district_id: {
            type: DataTypes.INTEGER,
            references: {
                model: District,
                key: 'district_id'
            },
            allowNull: false
        }
    });

    const Election = sequelize.define("Election", {
        election_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        year: DataTypes.INTEGER,
        date: DataTypes.DATE,
        office_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Office,
                key: 'office_id'
            }
        },
        type: {
            type: DataTypes.STRING,
            validate: {
                isIn: [["primary", "general", "runoff", "special"]]
            }
        },

        // used in primary elections
        party: {
            type: DataTypes.STRING,
        },
        // used in general elections
        general_election_id: {
            type: DataTypes.INTEGER
        },
        // used in runoffs
        original_election_id: {
            type: DataTypes.INTEGER,
        }
    });

    const Candidate = sequelize.define("Candidate", {
        candidate_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        first_name: DataTypes.STRING,
        middle_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        party: DataTypes.STRING,
        state_id: {
            type: DataTypes.INTEGER,
            references: {
                model: State,
                key: 'state_id'
            }
        },
        as_of: DataTypes.DATE
    });
    const Candidacy = sequelize.define("Candidacy", {
        candidacy_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        candidate_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Candidate,
                key: 'candidate_id'
            }
        },
        election_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Election,
                key: 'election_id'
            }
        },
        votes: {
            type: DataTypes.INTEGER
        }
    });
    const CampaignFinance = sequelize.define('CampaignFinance', {
        candidacy_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model:Candidacy,
              key: 'candidacy_id'
            }
        },
        contributions: DataTypes.DECIMAL(10,2),
        expenditures: DataTypes.DECIMAL(10,2)
    });

    const CandidateSearch = sequelize.define('CandidateSearch', {
      candidacy_id: {
          type: DataTypes.INTEGER,
          primaryKey: true
        },
        candidate_id: {
            type: DataTypes.INTEGER,
            references: {
                model: Candidate,
                key: 'candidate_id'
            }
        },
        first_name: DataTypes.STRING,
        middle_name: DataTypes.STRING,
        last_name: DataTypes.STRING,
        party: DataTypes.STRING,
        state_name: DataTypes.STRING,
        district: DataTypes.INTEGER,
        chamber_level:DataTypes.INTEGER,
        year:DataTypes.INTEGER,
        election_type:DataTypes.STRING
    }, {
  tableName: 'CandidateSearch',
  timestamps:false
})

    // for now, just build it
    for(let name in sequelize.models) {
        console.log("Handling",name);
        const m = sequelize.models[name];
        await m.sync();
    }

    console.log("Tables synchronized");

    return {
        State,
        Chamber,
        District,
        Office,
        Election,
        Candidate,
        Candidacy,
        CampaignFinance,
        CandidateSearch
    };
}

// function getState(state) {
//     if(state.state) state = state;
//     if(state.state_id) state = state_id;
//     state = state.trim().toLowerCase();
//     return statesJson.find(x => x.name == state || x.abbreviation == state || x.state_id == state);
// }
// function getChamberLevel(level) {
//     const save = level;

//     if(typeof level != 'string') level = level.level ?? level.chamber ?? level;

//     if(level == 0 || level == 1) return level;


//     if(level == 'house' || level == 'lower') return 0;
//     if(level == 'senate' || level == 'upper') return 1;

//     throw new Error("Failed to determine level from "+JSON.stringify(save));
// }
// function getDistrictNumber(obj) {
//     if(typeof obj == 'string' && parseInt(obj) == obj) return parseInt(obj);
//     if(typeof obj == 'string' && obj.match(/district (\d+)/)) return obj.match(/district (\d+)/)[1];

//     if(obj.district) return getDistrictNumber(obj.district);

//     throw new Error("Failed to determine district from "+JSON.stringify(obj));
// }

class StorageService {
    constructor(models) {
        this.models = models;
    }

    async saveDistrict(district) {
        const state = getState(district);
        if(!state) throw new Error("Unable to determine state from district");
        const level = getChamberLevel(district);

    }

    async saveElectionResult(result) {

    }
}

module.exports = async function GetStorage() {
    const models = await getModels();

    return {
        models
    };
}
