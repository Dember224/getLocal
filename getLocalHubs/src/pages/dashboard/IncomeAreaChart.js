import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// third-party
import ReactApexChart from 'react-apexcharts';

// chart options
const areaChartOptions = {
    chart: {
        height: 450,
        type: 'area',
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth',
        width: 2
    },
    grid: {
        strokeDashArray: 0
    }
};

// ==============================|| INCOME AREA CHART ||============================== //

const IncomeAreaChart = ({ slot, previousYears, turnouts }) => {
    const theme = useTheme();

    const { primary, secondary } = theme.palette.text;
    const line = theme.palette.divider;

    const [options, setOptions] = useState(areaChartOptions);

    useEffect(() => {
        setSeries([
            {
                name: 'Turnout',
                data: turnouts
            }
        ]);
    }, [turnouts]);

    useEffect(() => {
        setOptions((prevState) => ({
            ...prevState,
            colors: [theme.palette.primary.main, theme.palette.primary[700]],
            xaxis: {
                categories:
                     previousYears,
                labels: {
                    style: {
                        colors: [
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary,
                            secondary
                        ]
                    }
                },
                axisBorder: {
                    show: true,
                    color: line
                },
                tickAmount: 1
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
            }
        }));
    }, [primary, secondary, line, theme, slot, previousYears]);

    const [series, setSeries] = useState([
        {
            name: 'Turnout',
            data:[]
        }
    ],[]);



    return <ReactApexChart options={options} series={series} type="area" height={450} />;
};

IncomeAreaChart.propTypes = {
    slot: PropTypes.string
};

export default IncomeAreaChart;
