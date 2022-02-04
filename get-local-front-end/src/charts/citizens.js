import React from 'react';
import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';

export function RenderCitizenship(props){
  const population = [props.citizens, props.noncitizens];

  const CHART_DATA = [
    {
      name: 'Population',
      type:'column',
      data:population
    }
  ]

  const labels = ['citizens', 'non-citizens'];

  const chartOptions = merge(BaseOptionChart(), {
    stroke: { width: [0, 2, 3] },
    plotOptions: { bar: { columnWidth: '10%', borderRadius: 4,legend:{show:false}, horizontal: true } },
    fill: { type: ['solid', 'gradient', 'solid'] },
    labels,
    xaxis: { type: 'string' },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (y) => {
          if (typeof y !== 'undefined') {
            return `${y.toFixed(0)} people`;
          }
          return y;
        }
      }
    }
  });

  return (
    <Card>
      <CardHeader title="Population By Citizenship Status" subheader="Source: American Community 5-year Survey 2019" />
      <Box sx={{ p: 3, pb: 1 }} dir="ltr">
        <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} height={364}/>
      </Box>
    </Card>
  )
}
