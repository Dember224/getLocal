import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';
import { setSyntheticTrailingComments } from '../../../node_modules/typescript/lib/typescript';

// chart options
const columnChartOptions = {
    chart: {
        type: 'bar',
        height: 430,
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            columnWidth: '30%',
            borderRadius: 4
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 8,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['Democrat', 'Republican']
    },
    yaxis: {
        title: {
            text: '$'
        }
    },
    fill: {
        opacity: 1
    },
    tooltip: {
        y: {
            formatter(val) {
                return `$ ${val} thousands`;
            }
        }
    },
    legend: {
        show: true,
        fontFamily: `'Public Sans', sans-serif`,
        offsetX: 10,
        offsetY: 10,
        labels: {
            useSeriesColors: false
        },
        markers: {
            width: 16,
            height: 16,
            radius: '50%',
            offsexX: 2,
            offsexY: 2
        },
        itemMargin: {
            horizontal: 15,
            vertical: 50
        }
    },
    responsive: [
        {
            breakpoint: 600,
            options: {
                yaxis: {
                    show: false
                }
            }
        }
    ]
};

// ==============================|| SALES COLUMN CHART ||============================== //

const SalesColumnChart = ({contributions, expenditures}) => {
    const theme = useTheme();

    const { primary, secondary } = theme.palette.text;
    const line = theme.palette.divider;

    const warning = theme.palette.warning.main;
    const primaryMain = theme.palette.primary.main;
    const successDark = theme.palette.success.dark;

    const [series, setSeries] = useState([
        {
            name: 'Contributions',
            data: [0,0]
        },
        {
            name: 'Expenditures',
            data: [0,0]
        }
    ]);

    const [options, setOptions] = useState(columnChartOptions);

    useEffect(() => {
        setOptions((prevState) => ({
            ...prevState,
            colors: [warning, primaryMain],
            xaxis: {
                labels: {
                    style: {
                        colors: [secondary, secondary, secondary, secondary, secondary, secondary]
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: [secondary]
                    }
                }
            },
            grid: {
                borderColor: line
            },
            tooltip: {
                theme: 'light'
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: {
                    colors: 'grey.500'
                }
            }
        }));
        setSeries([{
            name: 'Contributions',
            data: contributions
        },
        {
            name: 'Expenditures',
            data: expenditures
        }])
    }, [primary, secondary, line, warning, primaryMain, successDark, contributions, expenditures]);

    return (
        <div id="chart">
            <ReactApexChart options={options} series={series} type="bar" height={430} />
        </div>
    );
};

export default SalesColumnChart;
