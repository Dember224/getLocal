const { Sequelize, Model, DataTypes } = require('sequelize');

module.exports = async function GetStorage() {
    const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres');

    const State = sequelize.define("State", {
        state_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        name: DataTypes.STRING,
        abbreviation: DataTypes.STRING
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
            allowNull: false
        }
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
                isIn: [["primary", "general", "runoff"]]
            }
        },

        party: {
            // used in primary elections
            type: DataTypes.STRING,
        },
        original_election_id: {
            // used in runoffs
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
        }
    });
    const CampaignFinance = sequelize.define('CampaignFinance', {
        candidacy_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        contributions: DataTypes.DECIMAL(10,2),
        expenditures: DataTypes.DECIMAL(10,2)
    });

    // for now, just build it
    for(let name in sequelize.models) {
        console.log("Handling",name);
        const m = sequelize.models[name];
        await m.sync();
    }

    console.log("Tables synchronized");

    return {
        models: {
            State,
            Chamber,
            District,
            Office,
            Election,
            Candidate,
            Candidacy,
            CampaignFinance
        }
    };
}