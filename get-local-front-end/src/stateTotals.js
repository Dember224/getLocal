import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';
import React, { useState, useEffect } from 'react';
import axios from 'axios';


export function LoadTotals() {

  const [queryResults, setQueryResults] = useState({data:[{"state":"North Carolina","contributions":"10747097.72","expenditures":"23820460.08"}]})

  useEffect(() =>{
    axios.get('http://localhost:4000/Totals')
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
        <CardHeader title="Totals Raised By State" subheader="most recent election cycle" />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364} />
        </Box>
      </Card>
    )
  }
