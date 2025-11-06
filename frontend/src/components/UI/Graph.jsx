import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Graph = ({ type, data, options, id }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart instance if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // Create a new chart instance
    new Chart(ctx, {
      type: type,
      data: data,
      options: options,
    });
    
  }, [data, options, type]); // Re-run effect if data or options change

  return (
    <div className="chart-container" style={{ position: 'relative', height: '100%' }}>
      <canvas ref={chartRef} id={id}></canvas>
    </div>
  );
};

export default Graph;