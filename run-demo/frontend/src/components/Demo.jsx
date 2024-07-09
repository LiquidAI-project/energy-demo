import {
  Box,
  Button,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import backgroundImage from "./../assets/yard.png";
import roadImage from "./../assets/road.png";
import cabinImage from "./../assets/cabin.png";
import houseImage from "./../assets/house.png";

const theme = createTheme({
  palette: {
    water: {
      main: "#8BD4E2",
      light: "#a7dee7",
      dark: "#0eafc9",
      contrastText: "#000000",
    },
    black: {
      main: "#000000",
    },
  },
  typography: {
    button: {
      textTransform: "none",
      fontWeight: "bolder",
    },
  },
});

import { List, ListItemButton, ListItemText, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

function useSessionStorageState(key, defaultValue) {
  // Initialize state with value from sessionStorage or the provided default value
  const [state, setState] = useState(() => {
    const savedState = window.sessionStorage.getItem(key);
    if (savedState) {
      return JSON.parse(savedState);
    } else {
      return defaultValue;
    }
  });

  const resetState = () => {
    setState(defaultValue);
    window.sessionStorage.setItem(key, JSON.stringify(defaultValue));
  };

  // Use useEffect to update sessionStorage when state changes
  useEffect(() => {
    window.sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState, resetState];
}

const Demo = () => {
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    // Reset all visibility to default
    setShowHeatPump(true);
    setShowElectricBoard(true);
    setShowElectricCar1(true);
  };
  const handleClear = () => {
    // clearing all components
    setShowHeatPump(false);
    setShowElectricBoard(false);
    setShowElectricCar1(false);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  // values from visual component visibility
  const [showHeatPump, setShowHeatPump] = useSessionStorageState(
    "showHeatPump",
    true
  );
  const [showElectricBoard, setShowElectricBoard] = useSessionStorageState(
    "showElectricBoard",
    true
  );
  const [showElectricCar1, setShowElectricCar1] = useSessionStorageState(
    "showElectricCar1",
    true
  );

  let totalConsumption = [];
  let totalProduction = [];
  let netConsumption = [];

  for (let i = 0; i <= 23; i++) {
    totalConsumption.push({ hour: i, value: 0 });
  }

  for (let i = 0; i <= 23; i++) {
    totalProduction.push({ hour: i, value: 0 });
  }

  for (let i = 0; i <= 23; i++) {
    netConsumption.push({ startHour: i, value: 0 });
  }

  netConsumption.forEach((h) => {
    const hourConsumption = totalConsumption.find(
      (obj) => obj.hour === h.startHour
    );
    const hourProduction = totalProduction.find(
      (obj) => obj.hour === h.startHour
    );
    h.value = (hourConsumption.value - hourProduction.value).toFixed(2);
  });

  return (
    <div>
      <div
        style={{
          position: "relative",
          top: 20,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            position: "absolute",
            top: "10px",
            left: "22px",
            zIndex: 1,
            fontWeight: "bold",
          }}
        >
          Energy Demo
        </Typography>
        <Grid
          container
          spacing={4}
          columns={5}
          style={{ paddingRight: "3vh", paddingLeft: "3vh" }}
        >
          <Grid item xs={12} sm={3} minWidth={"77vh"}>
            <Box>
              <div
                style={{
                  position: "relative",
                  marginTop: "15px",
                  paddingBottom: "83%",
                  width: "100%",
                  height: 0,
                }}
              >
                <img
                  src={backgroundImage}
                  alt="Home yard"
                  className="background-image"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "94.4%",
                    objectFit: "cover",
                    border: "1px solid #DCDCDC",
                    borderRadius: "5px",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                  }}
                />
                <div
                  className="overlay-content"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <img
                    src={roadImage}
                    alt="Road"
                    className="road-image"
                    style={{
                      position: "absolute",
                      top: "54%",
                      left: "47%",
                      width: "47.5%",
                      height: "40.655%",
                    }}
                  />
                  <img
                    src={cabinImage}
                    alt="Cabin"
                    className="cabin-image"
                    style={{
                      position: "absolute",
                      top: "67%",
                      left: "5%",
                      width: "30%",
                      height: "25%",
                    }}
                  />
                  <img
                    src={houseImage}
                    alt="House"
                    className="house-image"
                    style={{
                      position: "absolute",
                      top: "2%",
                      left: "5%",
                      width: "90%",
                      height: "55%",
                    }}
                  />
                </div>
              </div>
            </Box>
          </Grid>
          <Grid item xs={2} style={{ position: "relative", marginTop: "15px" }}>
            <Grid container spacing={1.5} columns={1}>
              <Grid item xs={1} paddingBottom="50px">
                <Box>
                  <List
                    sx={{ width: "94.5%", bgcolor: "background.paper" }}
                    style={{
                      position: "absolute",
                      zIndex: 1000,
                      border: "1px solid #DCDCDC",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                      paddingBottom: "0px",
                      paddingTop: "0px",
                    }}
                  >
                    <ListItemButton
                      onClick={handleClick}
                      sx={{ width: "100%" }}
                    >
                      <ListItemText
                        primary={
                          <Typography style={{ fontWeight: "bolder" }}>
                            Manage components
                          </Typography>
                        }
                      />
                      {open ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                      <List component="div">
                        <Grid container spacing={2}>
                          <Grid
                            sx={{ marginLeft: "40px", marginRight: "35px" }}
                          >
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={showHeatPump}
                                    onChange={() =>
                                      setShowHeatPump(!showHeatPump)
                                    }
                                    id="heatPumpCheckbox"
                                    sx={{
                                      "&.Mui-checked": {
                                        color: theme.palette.water.main,
                                      },
                                    }}
                                  />
                                }
                                label="Device 1"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={showElectricBoard}
                                    onChange={() =>
                                      setShowElectricBoard(!showElectricBoard)
                                    }
                                    id="electricBoardCheckbox"
                                    sx={{
                                      "&.Mui-checked": {
                                        color: theme.palette.water.main,
                                      },
                                    }}
                                  />
                                }
                                label="Device 2"
                              />
                            </FormGroup>
                          </Grid>
                          <Grid
                            sx={{ marginLeft: "40px", marginRight: "35px" }}
                          >
                            <FormGroup>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={showElectricCar1}
                                    onChange={() =>
                                      setShowElectricCar1(!showElectricCar1)
                                    }
                                    id="electricCar1Checkbox"
                                    sx={{
                                      "&.Mui-checked": {
                                        color: theme.palette.water.main,
                                      },
                                    }}
                                  />
                                }
                                label="Device 3"
                              />
                            </FormGroup>
                          </Grid>
                        </Grid>
                        <ThemeProvider theme={theme}>
                          <Button
                            style={{
                              marginLeft: "15px ",
                              marginBottom: "5px",
                            }}
                            onClick={handleReset}
                            variant="contained"
                            color="water"
                            id="selectAll"
                          >
                            Select all
                          </Button>
                        </ThemeProvider>
                        <ThemeProvider theme={theme}>
                          <Button
                            style={{
                              marginLeft: "15px ",
                              marginBottom: "5px",
                            }}
                            onClick={handleClear}
                            variant="contained"
                            color="water"
                            id="clearAll"
                          >
                            Clear all
                          </Button>
                        </ThemeProvider>
                      </List>
                    </Collapse>
                  </List>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default Demo;
