import { merge } from 'lodash';
import ReactApexChart from 'react-apexcharts';
// material
import { Card, CardHeader, Box } from '@material-ui/core';
import BaseOptionChart  from './materialUiCharts';
import React from 'react';


export function RenderRaceGraph(props) {

  const black = props.black ? props.black : 0;
  const asian = props.asian ? props.asian : 0;
  const mixed = props.mixed ? props.mixed : 0;
  const white = props.white ? props.white : 0;
  const native = props.native ? props.native : 0;
  const latino = props.latino ? props.latino : 0;
  const pacific = props.pacific ? props.pacific : 0;
  const other = props.other ? props.other : 0;

  const population = [black, asian, mixed, white, native, latino, pacific, other];


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
          <ReactApexChart type="line" series={CHART_DATA} options={chartOptions} height={364}/>
        </Box>
      </Card>
    )
}
