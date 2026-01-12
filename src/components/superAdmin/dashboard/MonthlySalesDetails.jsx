import React, { useState } from "react";
import { Chart } from "primereact/chart";

// Helper: Get 3-letter month name (e.g., "Jan") from month number
const monthAbbr = (month) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleString("default", { month: "short" });
};

// Filter and group by year and month
const groupByMonth = (companySales = [], year = new Date().getFullYear()) => {
  const filtered = companySales.filter(sale =>
    sale?.invoice_date?.startsWith(String(year))
  );
  const grouped = {};
  filtered.forEach(sale => {
    // Extract month (e.g., '01' in '2023-01-15')
    const month = sale.invoice_date.slice(5, 7);
    if (!grouped[month]) grouped[month] = { salesCount: 0, salesValue: 0 };
    grouped[month].salesCount++;
    grouped[month].salesValue += Number(sale.invoice_value || 0);
  });
  return grouped;
};

const YearlyMonthSalesDetails = ({ companySales = [], label = "", }) => {
  // Group data by month for the selected year
  const [year,setYear] =useState(new Date().getFullYear())
  const monthlyData = groupByMonth(companySales, year);
  const sortedMonths = Object.keys(monthlyData).sort();

  console.log(monthlyData);
  
  // Prepare data for Chart.js + PrimeReact
  const barChartData = {
    labels: sortedMonths.map(month => monthAbbr(month)),
    datasets: [
      {
        type: "bar",
        label: `${label} Sale Count (${year})`,
        data: sortedMonths.map(month => monthlyData[month].salesCount),
        backgroundColor: "#4CAF50",
        yAxisID: "y",
      },
      {
        type: "bar",
        label: `${label} Sales Value (₹) (${year})`,
        data: sortedMonths.map(month => monthlyData[month].salesValue),
        backgroundColor: "#2196F3",
        yAxisID: "y1",
      },
    ],
  };

  // Chart options: Dual Y-axes, themes, tooltips
  const barChartOptions = {
    maintainAspectRatio: false,
    aspectRatio: 0.8,
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
          display: true,
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
        ticks: {
          color: "#2196F3",
          font: {
            weight: "bold",
            size: 12,
          },
        },
        grid: {
          drawOnChartArea: false, // Only draw primary axis grid
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

  // Render
  return (
    <div className="flex w-full justify-evenly h-full">
     
      <div className="h-full w-11/12 flex items-center">
        <Chart
          type="bar"
          data={barChartData}
          options={barChartOptions}
          className="w-full h-full md:w-30rem"
        />
      </div>
    </div>
  );
};

export default YearlyMonthSalesDetails;
