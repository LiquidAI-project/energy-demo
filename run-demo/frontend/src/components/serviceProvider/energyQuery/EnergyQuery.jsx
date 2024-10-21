import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
} from "@mui/material";
import PropTypes from "prop-types";
import RealtimeClock from "./RealtimeClock";

const EnergyQuery = ({ onClick }) => {
  const [timeDuration, setTimeDuration] = useState("");
  const [totalPowerUsage, setTotalPowerUsage] = useState("0.0");
  const [deviceSpecificPowerUsage, setDeviceSpecificPowerUsage] = useState({}); 
  const [queryButtonDisable, setQueryButtonDisable] = useState(true);

  const handleTimeDurationChange = (event) => {
    setQueryButtonDisable(event.target.value === "" || event.target.value <= 0);
    setTimeDuration(event.target.value);
  };

  const handleButtonClick = async () => {

    setQueryButtonDisable(true);
    setTotalPowerUsage("0.0");
    setDeviceSpecificPowerUsage({});

    const powerUsageResponse = await onClick(timeDuration);

    if (Object.keys(powerUsageResponse).length === 0) {
      setTotalPowerUsage("0.0");
    } else {
      const sumOfValues = Object.values(powerUsageResponse).reduce(
        (sum, value) => sum + value,
        0
      );

      setQueryButtonDisable(false);
      setDeviceSpecificPowerUsage(powerUsageResponse);
      setTotalPowerUsage(sumOfValues.toFixed(5));
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "flex-start", width: "100%" }}
    >
      <Grid container style={{ width: "100%" }}>
        <Grid item xs={12} md={6}>
          <RealtimeClock />
        </Grid>
        <Grid item xs={12} md={6}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "5%",
            }}
          >
            <Typography variant="body1">Duration : </Typography>
            <TextField
              value={timeDuration}
              type="number"
              onChange={handleTimeDurationChange}
              InputProps={{
                style: { height: "30px" },
                endAdornment: <InputAdornment position="end">h</InputAdornment>,
              }}
              variant="outlined"
              style={{ width: "30%" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleButtonClick}
              disabled={queryButtonDisable}
            >
              Query
            </Button>
          </div>
          {Object.entries(deviceSpecificPowerUsage).map(
            ([deviceName, usage]) => (
              <Grid item xs={12} md={12} key={deviceName}>
                <Typography variant="body1" gutterBottom>
                  {deviceName}: {usage.toFixed(5)} kWh
                </Typography>
              </Grid>
            )
          )}
          <Typography variant="body1" style={{ marginTop: "5%", marginBottom: "5%" }}>
            Total Power Usage: {totalPowerUsage} kWh
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

EnergyQuery.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default EnergyQuery;
