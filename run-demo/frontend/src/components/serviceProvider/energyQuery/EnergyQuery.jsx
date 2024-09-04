import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
} from "@mui/material";
import { fetchPostData } from "../../../services/apiService";
import RealtimeClock from "./RealtimeClock";

const EnergyQuery = () => {
  const [timeDuration, setTimeDuration] = useState("");
  const [powerUsage, setPowerUsage] = useState("0.0");

  const handleTimeDurationChange = (event) => {
    setTimeDuration(event.target.value);
  };

  const handleClick = async () => {
    try {
      const timeDurationInSeconds = timeDuration * 3600;
      const startTime = new Date().getTime();
      const endpoint = `/execute/66d850d576a9328f5f1c9b24`; // TODO: Update the endpoint with the correct deployment ID. Up to now hardcod the correct deployment ID for testing.
      const postData = {
        param0: startTime,
        param1: timeDurationInSeconds,
      };
      const response = await fetchPostData(endpoint, postData);
      setPowerUsage(response[0]);
    } catch (error) {
      console.error("Error deploying module:", error);
      setPowerUsage("0.0");
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
            <Button variant="contained" color="primary" onClick={handleClick}>
              Query
            </Button>
          </div>
          <Typography variant="body1" style={{ marginTop: "10%" }}>
            Total Power Usage: {powerUsage}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};

export default EnergyQuery;
