import { Box, Text } from "@chakra-ui/react";
import { FunctionComponent, useRef } from "react";
import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";

interface ChartProps {
  data: uPlot.AlignedData;
}

const Chart: FunctionComponent<ChartProps> = ({ data }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box
        p={4}
        textAlign="center"
        borderWidth="1px"
        borderRadius="md"
        shadow="sm"
        bg="gray.50"
      >
        <Text fontSize="lg" color="gray.600">
          No data available to display the chart.
        </Text>
      </Box>
    );
  }

  const generateSeriesOptions = () => {
    return data.slice(1).map((_, index) => ({
      label: `Country ${index + 1}`,
      stroke: `hsl(${index * 30}, 70%, 50%)`,
      width: 2,
    }));
  };

  const options: uPlot.Options = {
    title: "COVID-19 Metric Over Time",
    width: 800,
    height: 400,
    padding: [20, 10, 40, 60], // Adjust padding for proper alignment
    scales: {
      x: { time: true },
      y: {},
    },
    series: [
      {
        label: "Time",
        value: (self, rawValue) =>
          new Date(rawValue * 1000).toLocaleDateString(),
      },
      ...generateSeriesOptions(),
    ],
    axes: [
      {
        stroke: "gray",
        grid: { show: true },
        label: "Date",
        labelSize: 16,
        size: 50,
      },
      {
        stroke: "gray",
        grid: { show: true },
        label: "Value",
        labelSize: 16,
        size: 60,
      },
    ],
    hooks: {
      setCursor: [
        (u) => {
          const tooltip = tooltipRef.current;
          const { left, top, idx } = u.cursor;

          // Check if tooltip exists and the cursor is in range
          if (tooltip && idx !== null && left !== null && top !== null) {
            // Tooltip content with series values at hovered point
            const date = new Date(
              data[0][idx as number] * 1000
            ).toLocaleDateString();
            let content = `<strong>Date: ${date}</strong><br>`;
            u.series.forEach((s, i) => {
              if (i === 0) return; // Skip x-axis label
              content += `${s.label}: ${data[i][idx as number]}<br>`;
            });

            tooltip.innerHTML = content;
            tooltip.style.display = "block";
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
          } else if (tooltip) {
            // Hide the tooltip when the cursor is outside the chart
            tooltip.style.display = "none";
          }
        },
      ],
    },
  };

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="md"
      shadow="md"
      bg="white"
      maxWidth="900px"
      mx="auto"
      mb={6}
      position="relative"
    >
      <UplotReact options={options} data={data} />
      <Box
        ref={tooltipRef}
        position="absolute"
        p={2}
        bg="white"
        borderRadius="md"
        boxShadow="md"
        fontSize="sm"
        zIndex="10"
        style={{
          pointerEvents: "none",
          display: "none",
          transform: "translate(-50%, -100%)",
        }}
      />
    </Box>
  );
};

export default Chart;
