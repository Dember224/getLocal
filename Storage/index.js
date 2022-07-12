const { Sequelize, Model, DataTypes } = require('sequelize');
require('dotenv').config()
const db_password = process.env.DB_PASSWORD
const db_uri = process.env.DB_URL_PROD;

const statesJson = require('./states.json');
statesJson.forEach(x => {
    x.name = x.name.toLowerCase();
})

async function getModels() {
  const db_url = process.env.DB_URL;
    const sequelize = new Sequelize(db_uri, {
      dialect:'postgres',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false
        }
      }
    });

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
    State.hasMany(Chamber, {
        foreignKey: 'state_id'
    });
    Chamber.belongsTo(State, {
        foreignKey: 'state_id'
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
    Chamber.hasMany(District, {
        foreignKey: 'chamber_id'
    });
    District.belongsTo(Chamber, {
        foreignKey: 'chamber_id'
    });
    District.prototype.getState = async function() {
        const chamber = await this.getChamber();
        return chamber.getState();
    };

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
    District.hasOne(Office, {
        foreignKey: 'district_id'
    });
    Office.belongsTo(District, {
        foreignKey: 'district_id'
    });
    Office.prototype.getChamber = async function() {
        const district = await this.getDistrict();
        return district.getChamber();
    };
    Office.prototype.getState = async function() {
        const chamber = await this.getChamber();
        return chamber.getState();
    }

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
    Office.hasMany(Election, {
        foreignKey: 'office_id'
    });
    Election.belongsTo(Office, {
        foreignKey: 'office_id'
    });

    Election.prototype.getDistrict = async function() {
        const office = await this.getOffice();
        return office.getDistrict();
    };
    Election.prototype.getState = async function() {
        const office = await this.getOffice();
        return office.getState();
    };

    Election.getElections = async function({state,year}, include) {
        return Election.findAll({
            where: {
                year,
            },
            include: [{
                model: Office,
                include: {
                    model: District,
                    include: {
                        model: Chamber,
                        include: {
                            model: State,
                            where: {
                                name: state
                            }
                        }
                    }
                }
            }, ...include]
        });
    };

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
    Candidate.belongsTo(State, {
        foreignKey: 'state_id'
    });
    State.hasMany(Candidate, {
        foreignKey: 'state_id'
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
    Candidate.hasMany(Candidacy, {
        foreignKey: 'candidate_id'
    });
    Candidacy.belongsTo(Candidate, {
        foreignKey: 'candidate_id'
    });

    Election.hasMany(Candidacy, {
        foreignKey: 'election_id'
    });
    Candidacy.belongsTo(Election, {
        foreignKey: 'election_id'
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
    Candidacy.hasOne(CampaignFinance, {
        foreignKey: 'candidacy_id'
    });
    CampaignFinance.belongsTo(Candidacy, {
        foreignKey: 'candidacy_id'
    });

    const candidate_search_query = `
      Create or replace View "CandidateSearch" as
      Select
      c.candidacy_id,
      c.candidate_id,
      Lower(cd.first_name) as first_name,
      Lower(cd.middle_name) as middle_name,
      Lower(cd.last_name) as last_name,
      cd.party,
      s.name as state_name,
      d.number as district,
      ch.level as chamber_level,
      e.year,
      e.type as election_type
      from "Candidacies" c
      left join "Candidates" cd
      on cd.candidate_id = c.candidate_id
      left join "Elections" e
      on e.election_id = c.election_id
      left join "Offices" o
      on e.office_id = o.office_id
      left join "Districts" d
      on d.district_id = o.district_id
      left Join "Chambers" ch
      on ch.chamber_id = d.chamber_id
      left Join "States" s
      on s.state_id = ch.state_id
    `;
    const cs = await sequelize.query(candidate_search_query);

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
        // CandidateSearch
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
