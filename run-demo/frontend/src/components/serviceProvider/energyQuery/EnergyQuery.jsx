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
  const [queryButtonDisable, setQueryButtonDisable] = useState(true);

  const handleTimeDurationChange = (event) => {
    setQueryButtonDisable(event.target.value === "" || event.target.value <= 0);
    setTimeDuration(event.target.value);
  };

  const handleButtonClick = async () => {

    setQueryButtonDisable(true);
    await onClick(timeDuration);
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
        </Grid>
      </Grid>
    </div>
  );
};

EnergyQuery.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default EnergyQuery;
