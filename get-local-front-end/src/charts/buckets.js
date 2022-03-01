import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function LoadBuckets() {

    const [queryResults, setQueryResults] = useState({data:[{"0 expenditures":"362"}]})

    useEffect(() =>{
      const endpoint = process.env.REACT_APP_ENV == 'development' ? process.env.REACT_APP_DEV_ENDPOINT : process.env.REACT_APP_API_URI;
      axios.get(`${endpoint}/buckets`, {
        headers: {
          "Access-Control-Allow-Origin": "*"
        }
      })
        .then((res)=>{
          console.log(res)
          setQueryResults(res);
        })
        .catch(function(error){
          console.log(error)
        })

      return function cleanup(){
        console.log('results displayed')
      }
    }, []);

    const bucket_count = Object.values(queryResults.data[0])

    const CHART_DATA = [
      {
        name:'Count',
        type:'column',
        data: bucket_count
      },
      {
        name:'Count',
        type:'column',
        data: bucket_count
      }
    ]

    const labels = Object.keys(queryResults.data[0])

    const chartOptions = merge(BaseOptionChart(), {
      stroke: { width: [0, 2, 3] },
      plotOptions: { bar: { columnWidth: '11%', borderRadius: 4 } },
      fill: { type: ['solid', 'gradient', 'solid'] },
      labels,
      xaxis: { type: 'string' },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y) => {
            if (typeof y !== 'undefined') {
              return `${y.toFixed(0)} candidates`;
            }
            return y;
          }
        }
      }
    });

    return (
      <Card>
        <CardHeader title="Count of Candidates Contributions/Expenditures in Range" subheader="most recent election cycle" />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
        </Box>
      </Card>
    )
}
