import { useEffect, useState, memo } from "react";
import { Box, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { hourlyEnergyData } from "../../assets/mockData/spotPrice";
import { useDemoVisualizationContext } from "../../context/demoVisualizationContext/useDemoVisualizationContext";

const Price = ({ price }) => {
  if (price !== null && price !== undefined) {
    return (
      <Typography>• Current price: {price.toFixed(2)} cents / kWh</Typography>
    );
  } else {
    return <Typography>• Loading current price</Typography>;
  }
};

const Consumption = ({ consumption }) => {
  if (consumption !== null && consumption !== undefined) {
    return (
      <Typography>
        • Current consumption: {consumption.toFixed(2)} kWh
      </Typography>
    );
  } else {
    return <Typography>• Loading current consumption</Typography>;
  }
};

const TotalConsumption = ({ total }) => {
  if (total !== null && total !== undefined) {
    return <Typography>• Total consumption: {total.toFixed(2)} kWh</Typography>;
  } else {
    return <Typography>• Loading total consumption</Typography>;
  }
};

const TotalPrice = ({ totalPrice }) => {
  if (totalPrice !== null && totalPrice !== undefined) {
    return <Typography>• Total Price: {totalPrice.toFixed(2)} €</Typography>;
  } else {
    return <Typography>• Loading total price</Typography>;
  }
};

const Chart = memo(function Chart({ consumptionData }) {
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const allSeries = [
    {
      id: "cost",
      label: "Cost (cents)",
      data: consumptionData.map((entry) => entry.total),
      color: "#f57c00"
    },
    {
      id: "consumption",
      label: "Consumption (kWh)",
      data: consumptionData.map((entry) => entry.consumption),
      color: "#2e7d32"
    }
  ];
  const visibleSeries = allSeries.filter(s => !hiddenSeries.includes(s.id));

  const updateSeries = (series) => {
    setHiddenSeries(prev =>
      prev.includes(series.id)
        ? prev.filter(id => id !== series.id)
        : [...prev, series.id]
    );
  };

  const yAxis =
    visibleSeries.length === 1
      ? [
        {
          id: visibleSeries[0].id,
          label: visibleSeries[0].label,
          color: visibleSeries[0].color,
          position: "left",
          min: 0,
          max: 20,
          tickLabelStyle: { fontSize: 14 },
          labelStyle: { fontSize: 12 }
        },
      ]
      : [{
        min: 0,
        max: 20
      }];

  return (
    <Box
      sx={{
        background: "white",
        width: "69vh",
        height: "30vh",
        paddingLeft: "12px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Custom legend */}
      <Box display="flex" gap={1} ml={14}>
        {allSeries.map((s) => (
          <Box
            key={s.id}
            onClick={() => updateSeries(s)}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 1,
              backgroundColor: visibleSeries.some(o => o.id === s.id) ? "#e0e0e0" : "#f5f5f5",
              border: "1px solid #ccc",
            }}
          >
            {/* Color indicator */}
            <Box
              sx={{
                width: 16,
                height: 16,
                backgroundColor: s.color,
                marginRight: 1,
                borderRadius: "2px",
              }}
            />
            <Typography variant="body2">{s.label}</Typography>
          </Box>
        ))}
      </Box>
      {/* Bar Chart with built-in legend hidden */}
      <BarChart
        xAxis={[{
          data: consumptionData.map((entry) => entry.hour),
          scaleType: "band",
          label: "Time (h)",
          tickLabelStyle: { fontSize: 14 },
          labelStyle: { fontSize: 12 }
        }]}
        series={visibleSeries}
        yAxis={yAxis}
        slots={{
          legend: () => null
        }}
        sx={{
          '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
            transform: 'translateX(-10px)'
          }
        }}
      />
    </Box>
  );
});

function ElectricityPrice({ demoTime, demoPassedHrs, totalConsumption }) {
  const { dischargingSlots } = useDemoVisualizationContext();
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentConsumption, setCurrentConsumption] = useState(null);

  // Initialize consumptionData from sessionStorage or default
  const [consumptionData, setConsumptionData] = useState(() => {
    const stored = window.sessionStorage.getItem("consumptionData");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse consumptionData from sessionStorage", e);
      }
    }
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      total: 0,
      consumption: 0.0
    }));
  });

  const [total, setTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  // Helper function to check if an hour is in discharging period
  const isHourDischarging = (hour) => {
    return dischargingSlots.some(slot => hour >= Math.floor(slot.start) && hour < Math.ceil(slot.end));
  }

  // Recalculate totals when consumptionData or totalConsumption changes (e.g., on page refresh)
  useEffect(() => {
    if (totalConsumption.length > 0 && demoPassedHrs > 0) {
      const currentHour = new Date(demoTime).getHours();

      const total = totalConsumption
        .filter((entry) => entry.hour <= currentHour && !isHourDischarging(entry.hour))
        .reduce((sum, entry) => sum + entry.value, 0);

      const totalPrice = consumptionData
        .filter((entry) => entry.hour <= currentHour && !isHourDischarging(entry.hour))
        .reduce((sum, entry) => sum + entry.total, 0);

      setTotal(total);
      setTotalPrice(totalPrice);
    }
  }, [consumptionData, totalConsumption, demoTime, demoPassedHrs, dischargingSlots]);


  useEffect(() => {
    const newPrice = updateCurrentPrice(hourlyEnergyData, demoTime);
    const newCurrentConsumption = updateCurrentConsumption(
      totalConsumption,
      demoTime
    );
    setCurrentPrice(newPrice);
    setCurrentConsumption(newCurrentConsumption);

    if (demoPassedHrs === 0) {
      const initialData = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        total: 0,
        consumption: 0.0
      }));
      initialData[0] = {
        hour: 0,
        total: newPrice * newCurrentConsumption,
        consumption: currentConsumption
      };
      setConsumptionData(initialData);
      window.sessionStorage.setItem("consumptionData", JSON.stringify(initialData));

      // Reset totals on restart
      setTotal(0);
      setTotalPrice(0);
    } else if (demoPassedHrs < 24 && new Date(demoTime).getMinutes() === 50) {
      const currentHour = new Date(demoTime).getHours();

      // Skip updating data for discharging hours
      if (!isHourDischarging(currentHour)) {
        setConsumptionData((prev) => {
          const newItem = {
            hour: currentHour,
            total: newPrice * newCurrentConsumption
          };

          const updated = prev.map((item) =>
            item.hour === newItem.hour ? { ...item, total: newItem.total, consumption: currentConsumption } : item
          );

          window.sessionStorage.setItem("consumptionData", JSON.stringify(updated));
          return updated;
        });
      }

      const total = totalConsumption
        .filter((entry) => entry.hour <= new Date(demoTime).getHours() && !isHourDischarging(entry.hour))
        .reduce((sum, entry) => sum + entry.value, 0);

      const totalPrice = consumptionData
        .filter((entry) => entry.hour <= new Date(demoTime).getHours() && !isHourDischarging(entry.hour))
        .reduce((sum, entry) => sum + entry.total, 0);

      setTotal(total);
      setTotalPrice(totalPrice);
    }


  }, [demoPassedHrs, demoTime, totalConsumption]);

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

  return (
    <Box
      sx={{
        height: "44vh",
        padding: "5px",
      }}
    >
      <Typography style={{ fontWeight: "bolder", marginBottom: "10px" }}>
        Hourly cost of consumed electricity
      </Typography>
      <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
        <Price price={currentPrice} />
        <Consumption consumption={currentConsumption} />
      </Box>
      <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
        <TotalConsumption total={total} />
        <TotalPrice totalPrice={totalPrice / 100} />
      </Box>
      <Chart consumptionData={consumptionData} />
    </Box>
  );
}

export default ElectricityPrice;