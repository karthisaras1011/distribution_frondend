import React, { useEffect, useMemo, useState } from "react";
import { getCompany } from "../../../service/superAdmin/dashboard";
import { Chart } from 'primereact/chart';
import { elements, plugins } from "chart.js";

const CompanyDetails = () => {
    const [company, setCompany] = useState([]);
    const [chartData, setChartData] = useState({});
    const [barChartData, setBarChartData] = useState({});

    // Derived stats
    const totalCompany = useMemo(() => company.length, [company]);
    const activeCompany = useMemo(() => company.filter(c => c.company_status === 1).length, [company]);
    const deActiveCompany = useMemo(() => company.filter(c => c.delete_status === 1).length, [company]);

    // Group by product type
    const productTypeDetails = useMemo(() => {
        return company.reduce((acc, item) => {
            if (!acc[item.product_type]) acc[item.product_type] = [];
            acc[item.product_type].push(item);
            return acc;
        }, {});
    }, [company]);
    const options = {
        cutout: '60%', radius: '95%',
        elements: {
            arc: {
                borderWidth: 1,
                borderColor: '#00000'
            },
             point: {
                radius: 3, // Hide points for better zoom experience
                hoverRadius: 5
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#FFFFF0', // Color of legend text
                    font: { size: 12, },
                    // borderWidth: 10,
                    usePointStyle: true,        // Use point style (circle by default)
                    pointStyle: 'rectRounded'
                },
                position: "bottom",
                align: 'center',
            },
            tooltip: {
                enabled: true,           // Show tooltip on hover
                backgroundColor: '#ffffff',
                titleColor: '#495057',
                bodyColor: '#212529',
                footerColor: '#495057',
                padding: 8,
                borderWidth: 1,
                borderColor: '#dee2e6',
                displayColors: true,
                usePointStyle: true
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'xy',
            intersect: false
        },
        // Zoom configuration
      
    }
    // Fetch data
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getCompany();
                setCompany(res?.data?.success ? res.data.data : []);
            } catch (error) {
                console.error(error);
                // Consider user feedback here
            }
        };
        fetchDetails();
    }, []);

    // Update charts when data changes
    useEffect(() => {
        // Pie/Doughnut chart data
        const typeData = Object.entries(productTypeDetails).map(([key, value]) => ({
            label: key,
            value: value.length
        }));
        setChartData({
            labels: typeData.map(item => item.label),
            datasets: [{
                data: typeData.map(item => item.value),
                backgroundColor: ['#406A9B', '#F3D159', '#6B493F', '#4AB0B3', '#8AA624'],
                hoverBackgroundColor: ['#406A9B', '#F3D159', '#6B493F', '#4AB0B3', '#8AA624']

            }]

        });

        // Bar chart data
        setBarChartData({
            labels: ['Active', 'Inactive', 'Total'],
            datasets: [{
                label: 'COMPANY  STATUS',
                data: [activeCompany, deActiveCompany, totalCompany],
                backgroundColor: ['#80B639', '#AF72B3', '#146CA5']
            }]
        });
    }, [productTypeDetails, activeCompany, deActiveCompany, totalCompany]);
    const barChartOptions = {
        maintainAspectRatio: false,  // Lets the chart fill its container
        plugins: {
            legend: {
                labels: {
                    color: '#FFFFF0',      // Legend text color
                    font: {
                        size: 12,
                        family: 'sans-serif',
                        weight: 'bold',
                    },
                    usePointStyle: true,        // Use point style (circle by default)
                    pointStyle: 'rectRounded'
                    // padding: 16            // Padding between items
                },
                position: "bottom",         // 'top', 'bottom', 'left', 'right'
                // fullSize: true           // Whether to make the legend take up the full width of the canvas
            },
            tooltip: {
                enabled: true,           // Show tooltip on hover
                backgroundColor: '#ffffff',
                titleColor: '#495057',
                bodyColor: '#212529',
                footerColor: '#495057',
                padding: 8,
                borderWidth: 1,
                borderColor: '#dee2e6',
                displayColors: true,
                usePointStyle: true
            },

        },
        interaction: {
            mode: 'nearest',
            axis: 'xy',
            intersect: false
        },
        // Zoom configuration
        elements: {
            point: {
                radius: 3, // Hide points for better zoom experience
                hoverRadius: 5
            }
        },

        scales: {
            x: {
                stacked: false,          // For grouped bars, set to true for stacked
                ticks: {
                    color: '#495057',      // Axis label color
                    font: {
                        weight: 'bold',      // Axis label font weight
                        size: 12
                    }
                },
                grid: {
                    display: false,        // Hide X-axis grid lines
                    drawBorder: false      // Hide X-axis border
                }
            },
            y: {
                stacked: false,          // Set to true for stacked bars on Y-axis
                beginAtZero: true,       // Y-axis starts at zero
                ticks: {
                    color: '#495057',      // Axis label color
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                },
                grid: {
                    color: '#ebedef'

                }
            }
        }
    };

    return (
        <div className="flex flex-col w-full text-white  h-11/12">
            <div className="text-2xl ml-4">
                <p >Company</p>
            </div>
            <div className="flex justify-evenly  ">
                <div className=" h-full  flex items-center">
                    <Chart
                        type="doughnut"
                        data={chartData}
                        options={options}
                        className="w-full md:w-30rem"
                    />
                </div>
                <div className=" h-full flex items-center">
                    <Chart
                        type="bar"
                        data={barChartData}
                        options={barChartOptions}
                        className="w-full h-full md:w-30rem"
                    />
                </div>
            </div>
        </div>
    );
};

export default CompanyDetails;
