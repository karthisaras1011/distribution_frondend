import React from "react";
import { Chart } from "primereact/chart";

// Group sales data by year
const groupByYear = (companySales = []) => {
  const grouped = {};
  function formatDate(dateStr) {
    // check if format is DD-MM-YYYY
    if (dateStr.includes("-") && dateStr.split("-")[2].length === 4) {
      const [dd, mm, yyyy] = dateStr.split("-");
      return `${yyyy}`;
    }
    return dateStr.slice(0,4); // already in YYYY-MM-DD
  }
  companySales.forEach((sale) => {
    if (!sale?.invoice_date) return;
    const year = formatDate(sale.invoice_date);
    grouped[year] = grouped[year] || { salesCount: 0, salesValue: 0 };
    grouped[year].salesCount++;
    const cleanValue = String(sale.invoice_value).replace(/,/g, "");
    grouped[year].salesValue += parseFloat(cleanValue) || 0;
  });  
  return grouped;
};

const YearlySalesDetails = ({ companySales = [], label = "" }) => {
  // Group by year
  const yearlyData = groupByYear(companySales);


  const sortedYears = Object.keys(yearlyData).sort();

  const barChartData = {
    labels: sortedYears,
    datasets: [
      {
        type: "bar",
        label: `${label} Sale Count`,
        data: sortedYears.map((year) => yearlyData[year].salesCount),
        backgroundColor: "#4CAF50",
        yAxisID: "y",
      },
      {
        type: "bar",
        label: `${label} Sales Value (₹)`,
        data: sortedYears.map((year) => yearlyData[year].salesValue),
        backgroundColor: "#2196F3",
        yAxisID: "y1",
      },
    ],
  };

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

  return (
    <div className="flex w-full justify-evenly h-full">
      <div className="h-full w-11/12 flex items-center">
        <Chart
          type="bar" // Required for PrimeReact to render, but supports dual-type datasets
          data={barChartData}
          options={barChartOptions}
          className="w-full h-full md:w-30rem"
        />
      </div>
    </div>
  );
};

export default YearlySalesDetails;
