import React, { useEffect, useMemo, useRef, useState } from "react";
import { getSales } from "../../../service/superAdmin/dashboard";
import { Chart } from 'primereact/chart';
import TodaySalesDetails from "./TodaySalesDetails";
import YearlySalesDetails from "./YearlyDetailsCount";
import YearlyMonthSalesDetails from "./MonthlySalesDetails";

const SalesDetails = () => {
    const [sales, setSales] = useState([]);
    const [companySales, setCompanySales] = useState([]);
    const [chartData, setChartData] = useState({});
    const [barChartData, setBarChartData] = useState({});
    const [isOpen, setIsOpen] = useState({ status: false, label: '' });
    const chartRef = useRef();
    // Derived stats
    const totalsales = useMemo(() => sales.length, [sales]);
    const activesales = useMemo(() => sales.filter(c => c.sales_status === 1).length, [sales]);
    const deActivesales = useMemo(() => sales.filter(c => c.delete_status === 1).length, [sales]);

    // Group by product type
    const productTypeDetails = useMemo(() => {
        return sales.reduce((acc, item) => {
            if (!acc[item.company_name]) acc[item.company_name] = [];
            acc[item.company_name].push(item);
            return acc;
        }, {});
    }, [sales]);
    // Fetch data
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await getSales();
                console.log("GetSale: ",res);
                
                setSales(res?.data?.success ? res.data.data : []);
            } catch (error) {
                console.error(error);
                // Consider user feedback here
            }
        };
        fetchDetails();
    }, []);

    // Update charts when data changes
    useEffect(() => {
        const typeData = Object.entries(productTypeDetails).map(([key, value]) => ({
            label: key,
            value: value.length
        }));
        setChartData({
            labels: typeData.map(item => item.label),
            datasets: [{
                label: `Total Sales ${sales?.length} `,
                data: typeData.map(item => item.value),
                backgroundColor: ['#FB923C', ],
                // hoverBackgroundColor: ['#FB923C',]
            }]
        });
        // Bar chart data
        // 
    }, [productTypeDetails, activesales, deActivesales, totalsales]);
    const barChartOptions = {
        indexAxis: 'x',
        aspectRatio: 0.8,
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
            }
        },

        scales: {
            x: {
                stacked: true,          // For grouped bars, set to true for stacked
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
                // grid: {
                //     color: '#ebedef'
                // }
            }
        },
         // Enable zoom and pan
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
    }
    };
    const onClick = async (event) => {
        const chart = chartRef.current.getChart();
        const activePoints = chart.getElementsAtEventForMode(
            event.nativeEvent,
            'nearest',
            { intersect: true },
            false
        );
        if (activePoints.length) {
            const index = activePoints[0].index;
            const label = chart.data.labels[index];
            console.log(label);

            const companyFilterData = sales.filter((s) => s.company_name === label)
            console.log(companyFilterData);

            setCompanySales(companyFilterData)
            setIsOpen({ status: true, label: label })
        }
    };

    return (
        <div className="flex flex-col w-full text-white  h-11/12">
            <div className="text-2xl ml-4">
                <p >Sales Performance - Company</p>
            </div>
        <div className="flex w-full p-2 justify-evenly  h-full">
            {/* <div className="w-full h-full  flex items-center"> */}
            <Chart
                type="bar"
                data={chartData}
                ref={chartRef}
                options={barChartOptions}
                className="w-full "
                onClick={onClick}
            />
            {isOpen.status && (
                <div className="fixed inset-0  flex items-center justify-center h-full bg-black z-50  opacity-100"
                    onClick={() => setIsOpen({ status: false, label: '' })}
                >
                    <div className="p-6    rounded-lg shadow-xl  w-9/12  text-white "
                    >
                         <div className="grid grid-cols-1 h-full  gap-3">
                        <div className="grid grid-cols-2 h-full  gap-3">
                            <div className="bg-[#121212] rounded-md">
                                
                                <TodaySalesDetails companySales={companySales} label={isOpen.label} />
                            </div>
                            <div className="bg-[#121212] rounded-md">
                                <YearlyMonthSalesDetails companySales={companySales}  label={isOpen.label} />
                            </div>
                            </div>
                            <div className="bg-[#121212] rounded-md">
                                <YearlySalesDetails companySales={companySales} label={isOpen.label} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default SalesDetails;
