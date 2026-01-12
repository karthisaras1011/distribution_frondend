import React, { useState, useEffect, useRef } from "react";
import { Chart } from 'primereact/chart';
import { getRecentYearSales } from "../../../service/superAdmin/dashboard";

const WholeSalesDetails = () => {
  const [sales, setSales] = useState([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [totalCount, setTotalCount] = useState(0);
  const [totalValue, setTotalValue] = useState(0);
  const chartRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await getRecentYearSales();
        setSales(res?.data?.success ? res.data.data : []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDetails();
  }, []);

  useEffect(() => {
    if (sales.length === 0) return;

    // Generate last 12 months in reverse chronological order (newest first)
    const today = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const displayMonth = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      months.unshift({ key: monthKey, display: displayMonth });
    }

    // Create maps for easy lookup
    const salesMap = {};
    sales.forEach(sale => {
      salesMap[sale.month] = sale;
    });

    // Prepare data arrays in chronological order (oldest to newest)
    const monthlyCounts = [];
    const monthlyValues = [];
    
    months.forEach(monthObj => {
      const saleData = salesMap[monthObj.key];
      monthlyCounts.push(saleData ? saleData.invoice_count : 0);
      monthlyValues.push(saleData ? parseFloat(saleData.total_invoice_value || 0) : 0);
    });

    // Calculate month-over-month changes (absolute difference)
    console.log(monthlyCounts,monthlyValues);
    
    const diffSales = [monthlyCounts[0]];
    const diffValues = [monthlyValues[0]];
    for (let i = 1; i < monthlyCounts.length; i++) {
      diffSales.push(monthlyCounts[i] - monthlyCounts[i - 1]);
      diffValues.push(monthlyValues[i] - monthlyValues[i - 1]);
    }

    // Calculate totals from the aggregated data
    const overallTotalCount = monthlyCounts.reduce((sum, count) => sum + count, 0);
    const overallTotalValue = monthlyValues.reduce((sum, value) => sum + value, 0);
    
    setTotalCount(overallTotalCount);
    setTotalValue(overallTotalValue);

    // Extract display labels
    const displayLabels = months.map(m => m.display);

    // Prepare chart data
    setChartData({
      labels: displayLabels,
      datasets: [
        {
          label: "Invoice Count",
          data: monthlyCounts,
          backgroundColor: "#FFA726",
          type: "bar",
          yAxisID: "y",
        },
        {
          label: "Invoice Value (₹)",
          data: monthlyValues,
          backgroundColor: "#5C6BC0",
          type: "bar",
          yAxisID: "y",
        },
        {
          label: "Count Change (Diff)",
          data: diffSales,
          borderColor: "#26A69A",
          borderWidth: 3,
          type: "line",
          tension: 0.3,
          fill: false,
          yAxisID: "y1",
        },
        {
          label: "Value Change (Diff)",
          data: diffValues,
          borderColor: "#EF5350",
          borderWidth: 3,
          type: "line",
          tension: 0.3,
          fill: false,
          yAxisID: "y1",
        },
      ],
    });
  }, [sales]);

  const chartOptions = {
    indexAxis: "x",
    // aspectRatio: 0.85,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#FFFFF0",
          font: { size: 12, family: "sans-serif", weight: "bold" },
        },
        position: "bottom",
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#fff",
        titleColor: "#495057",
        bodyColor: "#212529",
        footerColor: "#495057",
        padding: 8,
        borderWidth: 1,
        borderColor: "#dee2e6",
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || "";
            if (label.includes("Change")) {
              const value = context.parsed.y;
              const sign = value >= 0 ? "+" : "";
              return label + ": " + sign + value.toLocaleString();
            } else if (label === "Invoice Value (₹)") {
              return label + ": ₹" + context.parsed.y.toLocaleString();
            } else {
              return label + ": " + context.parsed.y.toLocaleString();
            }
          }
        }
      }
    },
    scales: {
      x: {
        stacked: false,
        ticks: { color: "#495057", font: { weight: "bold", size: 12 } },
        grid: { display: false, drawBorder: false }
      },
      y: {
        stacked: false,
        beginAtZero: true,
        position: "left",
        ticks: { 
          color: "#495057", 
          font: { weight: "bold", size: 12 },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
      },
      y1: {
        type: "linear",
        position: "right",
        grid: { drawOnChartArea: false },
        ticks: { 
          color: "#26A69A", 
          font: { weight: "bold", size: 12 },
          callback: function(value) {
            return value.toLocaleString();
          }
        },
      },
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

 

  return (
    <div className="flex flex-col w-full h-full text-white ">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl ">Sales Overall Performance </h2>
        <div className="flex gap-4 text-lg ">
          <div>
            Total Invoice Count: <span className="text-orange-500">{totalCount.toLocaleString()}</span>
          </div>
          <div>
            Total Invoice Value: <span className="text-blue-500">₹{totalValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
        <Chart
          type="bar"
          data={chartData}
          options={chartOptions}
          className="w-full h-full"
          style={{ width: '100%', }}
        />
      {/* </div> */}
    </div>
  );
};

export default WholeSalesDetails;