CREATE TABLE fips_by_state_chamber_district (
  state_name varchar(50) Not Null,
  state_fip INT Not NUll,
  district INT Not Null,
  chamber_name varchar(255),
  chamber varchar(50),
  year INT NOT NULL,
  latitude Decimal(8,6) NOT NULL,
  longitude Decimal(9,6) Not NUll,
  ID serial primary key
);
