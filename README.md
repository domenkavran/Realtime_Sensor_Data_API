## Realtime Sensor Data API: From The Thing Network to MySQL and Express API

Python scripts for realtime uploading/saving of sensor data from The Thing Network to a MySQL database and Express API for serving sensor data.

## Instructions

- **Initialization:**
  - Create local MYSQL database with name `sensors` and table `data`
  - Upload the database dump from `/FETCH_REALTIME_DATA/sample_data/database_dump/dump_table_data_till_29_11_2024.csv` (Data will be made available later)

- **Read and save historical data (Data will be made available later):**
  - Run `python ./FETCH_REALTIME_DATA/upload.py ./FETCH_REALTIME_DATA/sample_data/measurements.txt` (set database connection parameters at the top of the script) to save historical data from .txt file to the database
  - Run `python ./FETCH_REALTIME_DATA/remove_duplicates.py` (set database connection parameters at the top of the script) to remove duplicated entries in the database

- **Realtime fetching of sensor data:** `python /FETCH_REALTIME_DATA/fetch.py` (a creation of The Things Network application with connected sensors is needed before-hand)

- **Using the API**:
  - Running API: `node ./API/server.js` (set database connection parameters in `/API/config/db.config.js`)
  - API URL: `localhost:3000/api`
  - Routes:
    - Getting a list of all available sensors: `/data/sensors`
    - Getting data for a selected sensor by it's name `SENSOR_NAME` from starting date `START_DATE` till ending date `END_DATE`: `/data/by/SENSOR_NAME?start_date=START_DATE&end_date=END_DATE`
