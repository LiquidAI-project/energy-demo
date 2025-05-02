import { useEffect, useState, memo } from "react";
import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { hourlyEnergyData } from "../../assets/mockData/spotPrice";

const Price = ({ price }) => {
  if (price !== null && price !== undefined) {
    return (
      <Typography>Current price: {price.toFixed(2)} cents / kWh</Typography>
    );
  } else {
    return <Typography>Loading current price</Typography>;
  }
};

const Consumption = ({ consumption }) => {
  if (consumption !== null && consumption !== undefined) {
    return (
      <Typography>Current consumption: {consumption.toFixed(2)} kWh</Typography>
    );
  } else {
    return <Typography>Loading current consumption</Typography>;
  }
};

const TotalConsumption = ({ total }) => {
  if (total !== null && total !== undefined) {
    return <Typography>Total consumption: {total.toFixed(2)} kWh</Typography>;
  } else {
    return <Typography>Loading total consumption</Typography>;
  }
};

const Chart = memo(function Chart({ consumptionData }) {
  if (
    consumptionData.length > 0 &&
    !consumptionData.every((item) => isNaN(item.time) || isNaN(item.total))
  ) {
    const xAxisData = consumptionData.map(
      (entry) =>
        entry.time.getHours() +
        ":00-" +
        (parseInt(entry.time.getHours()) + 1) +
        ":00"
    );
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
            data: consumptionData.map((entry) => entry.total),
            area: true,
            curve: "natural",
            showMark: false,
            label: "cents",
          },
        ]}
        sx={{
          "& .MuiAreaElement-root": {
            fillOpacity: 0.4,
          },
        }}
      />
    );
  }
  return null;
});

function ElectricityPrice({ demoTime, demoPassedHrs, totalConsumption }) {
  const [prices, setPrices] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentConsumption, setCurrentConsumption] = useState(null);
  const [consumptionData, setConsumptionData] = useState([]);

  useEffect(() => {
    const newPrice = updateCurrentPrice(hourlyEnergyData, demoTime);
    const newCurrentConsumption = updateCurrentConsumption(
      totalConsumption,
      demoTime
    );
    setCurrentPrice(newPrice);
    setCurrentConsumption(newCurrentConsumption);
    if (demoPassedHrs === 0) {
      setConsumptionData([
        { time: new Date(demoTime), total: newPrice * newCurrentConsumption },
      ]);
      window.sessionStorage.setItem(
        "consumptionData",
        JSON.stringify([
          { time: new Date(demoTime), total: newPrice * newCurrentConsumption },
        ])
      );
    } else if (demoPassedHrs < 24) {
      setConsumptionData((prev) => {
        const newItem = {
          time: new Date(demoTime),
          total: newPrice * newCurrentConsumption,
        };

        if (
          !prev.some((item) => item.time.getTime() === newItem.time.getTime())
        ) {
          const newData = [...prev, newItem];
          window.sessionStorage.setItem(
            "consumptionData",
            JSON.stringify(newData)
          );
          return newData;
        }
        return prev;
      });
    }
  }, [demoPassedHrs, demoTime, prices, totalConsumption]);

  function updateCurrentConsumption(totalConsumption, demoTime) {
    const demoTimeFormatted = new Date(demoTime);
    if (totalConsumption.length === 0) {
      return null;
    } else {
      return totalConsumption.find(
        (obj) => obj.hour === demoTimeFormatted.getHours()
      ).value;
    }
  }

  function updateCurrentPrice(prices, demoTime) {
    if (prices.length === 0) {
      return null;
    } else {
      const demoTimeCopy = new Date(demoTime);
      const priceObj = prices.find(
        (priceObj) => priceObj.hour == demoTimeCopy.getHours()
      );
      if (priceObj) {
        return priceObj.price;
      }
    }
  }

  const total = totalConsumption.reduce((a, b) => a + b.value, 0);

  return (
    <Box
      sx={{
        height: "44vh",
      }}
    >
      <Typography sx={{ marginBottom: "7px", fontWeight: "bold" }}>
        Hourly cost of consumed electricity
      </Typography>
      <Price price={currentPrice} />
      <Consumption consumption={currentConsumption} />
      <TotalConsumption total={total} />
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

export default ElectricityPrice;
