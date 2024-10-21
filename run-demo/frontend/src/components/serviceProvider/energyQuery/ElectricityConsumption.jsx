import { memo } from "react";
import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import PropTypes from "prop-types";

const Chart = memo(function Chart({ consumptionData }) {
  // Preprocess the data to ensure all time fields are Date objects
  const processedData = consumptionData.map((entry) => ({
    ...entry,
    time: entry.time instanceof Date ? entry.time : new Date(entry.time),
  }));

  // Check if data is available and valid
  const hasValidData =
    processedData.length > 0 &&
    !processedData.every((item) => isNaN(item.time) || isNaN(item.total));

  const currentTime = new Date();
  const currentHour = currentTime.getHours();

  // If valid data exists, use it; otherwise, create one placeholder data point
  const xAxisData = hasValidData
    ? processedData.map((entry) => {
        return (
          entry.time.getHours() +
          ":00-" +
          (parseInt(entry.time.getHours()) + 1) +
          ":00"
        );
      })
    : [`${currentHour}:00-${currentHour + 1}:00`];

  const seriesData = hasValidData
    ? processedData.map((entry) => parseFloat(entry.total))
    : [0];

  return (
    <LineChart
      xAxis={[
        {
          data: xAxisData,
          scaleType: "band",
          label: "time (h)",
          tickLabelStyle: { fontSize: 10 },
        },
      ]}
      series={[
        {
          data: seriesData,
          area: true,
          curve: "natural",
          showMark: false,
          label: "kWh",
          valueFormatter: (value) => value.toFixed(7),
        },
      ]}
      tooltip={{
        valueFormatter: (value) => `${value.toFixed(7)} kWh`,
      }}
      sx={{
        "& .MuiAreaElement-root": {
          fillOpacity: 0.4,
        },
      }}
    />
  );
});

Chart.propTypes = {
  consumptionData: PropTypes.array.isRequired,
};

function ElectricityConsumption({ consumptionData }) {
  ElectricityConsumption.propTypes = {
    consumptionData: PropTypes.array.isRequired,
  };

  return (
    <Box
      sx={{
        height: "34vh",
      }}
    >
      <Typography sx={{ marginBottom: "7px", fontWeight: "bold" }}>
        Hourly cost of consumed electricity
      </Typography>
      <Box
        sx={{
          background: "white",
          width: "45vh",
          height: "28vh",
        }}
      >
        <Chart consumptionData={consumptionData} />
      </Box>
    </Box>
  );
}

export default ElectricityConsumption;
