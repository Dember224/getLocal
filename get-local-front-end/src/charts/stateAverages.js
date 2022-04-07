import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export function LoadAverages() {
  const [queryResults, setQueryResults] = useState({data:[{"state":"North Carolina","contributions":"93453.02","expenditures":"207134.44"}]})

  useEffect(() =>{
    const endpoint = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_DEV_ENDPOINT : process.env.REACT_APP_API_URI;
    axios.get(`${endpoint}/averages`)
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

  const expend_data = queryResults.data.map(x=>{
    return x.expenditures;
  })
  const contrib_data = queryResults.data.map(x=>{
    return x.contributions
  })


  const CHART_DATA = [
    {
      name:'Expenditures',
      type:'column',
      data: expend_data
    },
    {
      name:'Contributions',
      type:'column',
      data:contrib_data
    }
  ]

    const labels = queryResults.data.map(x=>{
      return x.state;
    })
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
              return `${y.toFixed(0)} dollars`;
            }
            return y;
          }
        }
      }
    });

    return (
      <Card>
        <CardHeader title="A Campaigns Average Money Raised and Spent By State" subheader="most recent election cycle" />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
        </Box>
      </Card>
    )
}
