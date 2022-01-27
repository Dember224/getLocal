import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';
import React from 'react';


export function RenderRaceGraph(props) {

  const population = [props.black, props.asian, props.mixed, props.white, props.native, props.latino, props.pacific, props.other];


  const CHART_DATA = [
    {
      name:'Population',
      type:'column',
      data: population
    }
  ]

    const labels = ["Black", "Asian", "Mixed Race", "White", "Native American", "Latino", "Pacific Islander", "Other Race"]
    const chartOptions = merge(BaseOptionChart(), {
      stroke: { width: [0, 2, 3] },
      plotOptions: { bar: { columnWidth: '40%', borderRadius: 4, distributed:true,legend:{show:false} } },
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
        <CardHeader title="Population By Race" subheader="Source: American Community 5-year Survey 2019" />
        <Box sx={{ p: 3, pb: 1 }} dir="ltr">
          <ReactApexChart type="bar" series={CHART_DATA} options={chartOptions} height={364}/>
        </Box>
      </Card>
    )
}
