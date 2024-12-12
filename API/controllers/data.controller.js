const moment = require('moment');
const { Op } = require('sequelize');

const db = require("../models/index.js");
const Data = db.data;

const sensor_name_to_internal_name = {
  "a81758fffe0b94ce": "tmp-16",
  "a81758fffe0b94cf": "tmp-17",
  "a81758fffe0b94d0": "tmp-18",
  "a81758fffe0b94d2": "tmp-14",
  "eui-a81758fffe0aa4b1": "tmp-6",
  "eui-a81758fffe0aa4b2": "tmp-5",
  "eui-a81758fffe0aa4b3": "tmp-7",
  "eui-a81758fffe0aa4b4": "tmp-11",
  "eui-a81758fffe0aa4b5": "tmp-3",
  "eui-a81758fffe0aa58d": "tmp-1",
  "eui-a81758fffe0aa58e": "tmp-13",
  "eui-a81758fffe0aa58f": "tmp-4",
  "eui-a81758fffe0aa590": "tmp-8",
  "eui-a81758fffe0aa591": "tmp-12",
  "eui-a81758fffe0aa59c": "tmp-2",
  "eui-a81758fffe0aa59d": "tmp-10",
  "eui-a81758fffe0aa59e": "tmp-9"
}

async function queryData(req, res, sensor_name = null)
{
  const expectedQueryParams = ['N', 'start_date', 'end_date', 'limit'];
  const providedQueryParams = Object.keys(req.query);
  const unexpectedParams = providedQueryParams.filter(param => !expectedQueryParams.includes(param));
  if (unexpectedParams.length > 0) {
    return res.status(400).json({
      error: 'Unexpected query parameters',
      unexpectedParams: unexpectedParams
    });
  }

  try {
    let data;
    let query = {};
    // Check if 'N' parameter is present in the query string
    if (req.query.N && req.query.start_date && req.query.end_date)
    {
      return res.status(400).json({
        error: "Parameter 'N' can't be used along side the parameters 'start_date' and 'end_date'"
      });
    }
    else if (req.query.N) {
      const N = parseInt(req.query.N);
      if (isNaN(N)) {
        return res.status(400).send("Invalid 'N' parameter");
      }

      // Fetch the last 'N' rows, assuming 'timestamp' is your sorting column
      query = {
        where: {},
        order: [['timestamp', 'DESC']], // Adjust if you're using a different column for ordering
        limit: N
      }
    }
    else if (req.query.start_date && req.query.end_date)
    {
      let start_date = req.query.start_date;
      let end_date = req.query.end_date;

      if (moment(start_date, 'YYYY-MM-DD', true).isValid() && moment(end_date, 'YYYY-MM-DD', true).isValid())
      {
        start_date = moment(req.query.start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
        end_date = moment(req.query.end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss');

        query = {
          where: {
            timestamp: {
              [Op.between]: [start_date, end_date]
            }
          },
          order: [['timestamp', 'ASC']]
        }
      }
      else
      {
        return res.status(400).json({
          error: "Invalid 'start_date' or 'end_date' parameters (must be in format 'YYYY-MM-DD')"
        });
      }
    }
    else if (req.query.start_date)
    {
      let start_date = req.query.start_date;
      if (moment(start_date, 'YYYY-MM-DD', true).isValid())
      {
        start_date = moment(req.query.start_date).startOf('day').format('YYYY-MM-DD HH:mm:ss');

        query = {
          where: {
            timestamp: {
              [Op.gte]: start_date
            }
          },
          order: [['timestamp', 'ASC']]
        };
      }
      else
      {
        return res.status(400).json({
          error: "Invalid 'start_date' parameter (must be in format 'YYYY-MM-DD')"
        });
      }
    }
    else if (req.query.end_date)
    {
      let end_date = req.query.end_date;
      if (moment(end_date, 'YYYY-MM-DD', true).isValid())
      {
        end_date = moment(req.query.end_date).endOf('day').format('YYYY-MM-DD HH:mm:ss');

        query = {
          where: {
            timestamp: {
              [Op.lte]: end_date
            }
          },
          order: [['timestamp', 'ASC']]
        }
      }
      else
      {
        return res.status(400).json({
          error: "Invalid 'end_date' parameter (must be in format 'YYYY-MM-DD')"
        });
      }
    }
    if (sensor_name != null)
    {
      query['where'] = {};
      query['where']['sensor_name'] = sensor_name;
    }

    data = await Data.findAll(query);

    //add internal names
    data = data.map(data_entry => ({
      ...data_entry.dataValues,
      internal_name: sensor_name_to_internal_name[data_entry.sensor_name] || null
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
}

exports.getAllData = async (req, res) => {
  queryData(req, res);
};

exports.getUniqueSensorNames = async (req, res) => {
  try {
    let sensorNames = await Data.findAll({
      attributes: ['sensor_name'],
      group: ['sensor_name'],
    });

    //add internal names
    sensorNames = sensorNames.map(sensor => ({
      ...sensor.dataValues,
      internal_name: sensor_name_to_internal_name[sensor.sensor_name] || null
    }));

    res.json(sensorNames);
  } catch (error) {
    res.status(500).send({
      error: error.message
    });
  }
};

exports.getDataBySensorName = async (req, res) => {
  const { sensor_name } = req.params;
  queryData(req, res, sensor_name);
};