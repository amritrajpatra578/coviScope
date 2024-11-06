import { getCountryName, matrixType, TimeseriesData } from "@/defination";
import { Box } from "@chakra-ui/react";
import { FunctionComponent, useRef } from "react";
import uPlot from "uplot";
import UplotReact from "uplot-react";
import "uplot/dist/uPlot.min.css";

export interface ChartProps {
  data: TimeseriesData[];
  matrix: matrixType;
}

const Chart: FunctionComponent<ChartProps> = ({ data, matrix }) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // if there's no data to display
  if (!data || data.length === 0) {
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
        Data not available to display in the chart.
      </Box>
    );
  }

  // extracting a list of unique countries from the data
  const countries = Array.from(new Set(data.map((d) => d.country)));

  // preparing the X-axis data (dates)
  const dates = Array.from(
    new Set(data.map((d) => new Date(d.date).getTime()))
  );

  // preparing the Y-axis data (country values)
  const countryData = countries.map((country) => {
    return data
      .filter((d) => d.country === country) // Filter data for this country
      .map((d) => d.value); // Extract the values for each data point
  });

  // preparing the final uPlot data [x,y]
  const plotData: uPlot.AlignedData = [dates, ...countryData];

  const generateSeriesOptions = () => {
    return countries.map((country, index) => ({
      label: getCountryName(country) || country,
      stroke: `hsl(${index * 30}, 70%, 50%)`,
      width: 2,
    }));
  };

  const options: uPlot.Options = {
    title: "COVID-19 Metric Over Time",
    width: 800,
    height: 400,
    padding: [20, 10, 40, 60],
    scales: {
      x: { time: true },
      y: {},
    },
    series: [
      {
        label: "Date",
        value: (_, rawValue) => new Date(rawValue).toLocaleDateString(),
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
        (u: uPlot) => {
          const tooltip = tooltipRef.current;
          const { left, top, idx } = u.cursor;

          if (tooltip && idx !== null && left !== null && top !== null) {
            const date = new Date(
              plotData[0][idx as number]
            ).toLocaleDateString();
            let content = `<strong>Date: ${date}</strong><br>`;

            u.series.forEach((s, i) => {
              if (i !== 0) {
                content += `${s.label}: ${plotData[i][idx as number]}<br>`;
              }
            });

            tooltip.innerHTML = content;
            tooltip.style.display = "block";
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
          } else if (tooltip) {
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
      <UplotReact options={options} data={plotData} />
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
