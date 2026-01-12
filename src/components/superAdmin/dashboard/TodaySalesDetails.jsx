import React from "react";
import { Chart } from "primereact/chart";

const TodaySalesDetails = ({ companySales = [], label = "" }) => {

    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, "0"); // current month as "01", "02"...
    const monthName = String(new Date().toLocaleString('default', { month: 'long' }))
    // const filterDate = `${year}-${month}`;


    const filterDate = "2022-08-30"; // e.g., "2023-09" for September 2023
    const filterDaily = companySales.filter((m) => m?.invoice_date === filterDate);
    console.log(companySales, filterDaily);

    // Calculate metrics
    const salesCount = filterDaily.length;
    const salesValue = filterDaily.reduce((sum, sale) => {
        const amount = Number(sale?.invoice_value) || 0;
        return sum + amount;
    }, 0);


    // Combo chart (bar + line, dual-axis) data
    const barChartData = {
        labels: ["Count & Value"], // X-axis label – only one category
        datasets: [
            {
                type: "bar",
                label: `${label} ${filterDate}- Daily Sale Count`,
                data: [salesCount],
                backgroundColor: "#4CAF50",
                yAxisID: "y",
            },
            {
                type: "bar",
                label: `${label} ${filterDate}-Daily Sales Value (₹)`,
                data: [salesValue],
                borderColor: "#2196F3",
                backgroundColor: "#2196F3",
                // borderWidth: 30,
                fill: false,
                yAxisID: "y1",
            },
        ],
    };

    const barChartOptions = {
        maintainAspectRatio: false,
        // aspectRatio: 0.8,
        plugins: {
            legend: {
                labels: {
                    color: "#495057",
                    font: {
                        size: 12,
                        family: "sans-serif",
                        weight: "bold",
                    },
                },
                position: "bottom",
                // fullSize: true,
            },
            tooltip: {
                enabled: true,
                backgroundColor: "#ffffff",
                titleColor: "#495057",
                bodyColor: "#212529",
                footerColor: "#495057",
                padding: 8,
                borderWidth: 1,
                borderColor: "#dee2e6",
                displayColors: true,
                usePointStyle: true,
            },
        },
        scales: {
            x: {
                ticks: {
                    color: "#495057",
                    font: {
                        weight: "bold",
                        size: 12,
                    },
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
            y: {
                type: "linear",
                position: "left",
                title: {
                    display: true,
                    text: "Sale Count",
                    color: "#4CAF50",
                },
                min: 0,
                ticks: {
                    color: "#4CAF50",
                    font: {
                        weight: "bold",
                        size: 12,
                    },
                },
            },
            y1: {
                type: "linear",
                position: "right",
                title: {
                    display: true,
                    text: "Sales Value (₹)",
                    color: "#2196F3",
                },
                min: 0,
                grid: {
                    drawOnChartArea: false, // Only draw grid for the primary axis
                },
                ticks: {
                    color: "#2196F3",
                    font: {
                        weight: "bold",
                        size: 12,
                    },
                },
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
        }
    };

    return (
        <div className="flex w-full justify-evenly h-full">
            <div className="h-full w-11/12 flex items-center">
                <Chart
                    type="bar" // This is still required for PrimeReact to render, but dual-type datasets are supported
                    data={barChartData}
                    options={barChartOptions}
                    className="w-full h-full md:w-30rem"
                />
            </div>
        </div>
    );
};

export default TodaySalesDetails;
