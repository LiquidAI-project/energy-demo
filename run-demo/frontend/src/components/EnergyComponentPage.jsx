import { Grid, Box, Button, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import ArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import { useNavigate, useLocation } from "react-router-dom";
import { cloudBasedPlan } from "../assets/mockData/dailyPlan";
import { BarChart } from "@mui/x-charts/BarChart";
import fridgeView from "../assets/fridge_component_page.png";
import washingMachineView from "../assets/washingmachine_component_page.png";
import evChargerView from "../assets/evCharger_component_page.png";
import { useState, useEffect } from "react";
import { hourlyEnergyData } from "../assets/mockData/spotPrice";
// import NotFoundPage from "./NotFoundPage";

const theme = createTheme({
  palette: {
    water: {
      main: "#8BD4E2",
      light: "#a7dee7",
      dark: "#0eafc9",
      contrastText: "#000000",
    },
  },
  typography: {
    button: {
      textTransform: "none",
      fontWeight: "bolder",
    },
  },
});

const imageMapping = {
  "freezer": fridgeView,
  "washingMachine": washingMachineView,
  "evCharger": evChargerView,
};

const EnergyComponentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prices, setPrices] = useState([]);
  let optimizedConsumption = [];
  let chartData = [];
  let timeData = [];
  const start = window.sessionStorage.getItem("selectedStart");

  useEffect(() => {
    setPrices(hourlyEnergyData);
  }, []);

  window.onpopstate = () => navigate("/demo");

  if (location.state !== null) {
    const component = location.state.component;
    const componentData = cloudBasedPlan.filter(
      (c) => c.id === component.id
    )[0];
    let consumptionData = [];
    let totalConsumption = 0;
    let totalPrice = 0;
    let optimalPrice = 0;
    let savings = 0;
    let demoHours = [];
    let demoPrices = [];

    for (let i = 0; i <= 23; i++) {
      const price = prices.find((p) => parseInt(p.hour) === i);
      if (price !== undefined) {
        const priceCopy = { ...price };
        priceCopy.startHour = i;
        if (i < 9) {
          priceCopy.hour = "0" + i + ":00-0" + (i + 1) + ":00";
        } else if (i === 9) {
          priceCopy.hour = "09:00-10:00";
        } else if (i === 23) {
          priceCopy.hour = "23:00-00:00";
        } else {
          priceCopy.hour = i + ":00-" + (i + 1) + ":00";
        }
        demoPrices.push(priceCopy);
      }
      demoHours.push(i);
    }

    if (component.type === "consumer") {
      consumptionData = componentData.slots;
      consumptionData.forEach((h) => {
        const startHour = h.start;
        h.startHour = startHour;
        h.hour = startHour + ":00-" + (startHour + 1) + ":00";
      });
      totalConsumption = consumptionData
        .reduce((a, b) => {
          return a + b.value;
        }, 0)
        .toFixed(2);

      let timeOrderedConsumptionData = [];

      if (demoPrices.length === 24) {
        consumptionData.forEach((c) => {
          const value = c.value;
          const price = demoPrices.find(
            (p) => p.startHour === c.startHour
          ).price;
          const hourPrice = parseFloat(value) * parseFloat(price);
          totalPrice = totalPrice + hourPrice;
        });

        const sortedPrices = demoPrices.sort((a, b) => {
          return a.price - b.price;
        });
      }

      demoHours.forEach((hour) => {
        const match = consumptionData.find(
          (item) => hour >= item.start && hour < item.end
        );

        if (match) {
          const hourLabel = `${hour}:00-${hour + 1}:00`;
          timeOrderedConsumptionData.push({
            hour: hourLabel,
            value: match.value,
          });
        }
      });

      consumptionData = timeOrderedConsumptionData;
    }

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
              top: "-10px",
              left: "22px",
              zIndex: 1,
              fontWeight: "bold",
            }}
          >
            Energy Demo
          </Typography>
          <ThemeProvider theme={theme}>
            <Button
              variant="contained"
              color="water"
              startIcon={<ArrowLeftIcon />}
              sx={{ borderRadius: 2, left: "22px", marginTop: "25px" }}
              onClick={() => navigate("/demo")}
            >
              Back
            </Button>
          </ThemeProvider>
          <Grid container spacing={4} columns={5} style={{ paddingRight: "3vh", paddingLeft: "3vh" }}>
            <Grid item xs={12} sm={3} minWidth={"96vh"}>
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
                    id={`${component.id}-view`}
                    src={imageMapping[component.id]}
                    alt="Component view"
                    className="component-view-image"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "92%",
                      objectFit: "cover",
                      border: "1px solid #DCDCDC",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                </div>
              </Box>
            </Grid>
            <Grid
              item
              xs={2}
              style={{ position: "relative", marginTop: "15px" }}
            >
              <Grid container columns={1}>
                <Grid item xs={1} minWidth="50vh" paddingBottom="2vh">
                  <Box
                    style={{
                      padding: "2vh",
                      border: "1px solid #DCDCDC",
                      borderRadius: "5px",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    }}
                    height="auto"
                    overflow="hidden"
                  >
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      sx={{ margin: 2 }}
                    >
                      {component.name}
                    </Typography>
                    <Typography variant="body2" sx={{ margin: 2 }}>
                      {component.description}
                    </Typography>
                    {component.type === "consumer" && (
                      <>
                        <Typography variant="body2" sx={{ margin: 2 }}>
                          Energy consuming component
                        </Typography>
                        {start === "last" && (
                          <Typography variant="body2" sx={{ margin: 2 }}>
                            Predicted energy consumption in the next 24 hours:
                          </Typography>
                        )}
                        {start === "next" && (
                          <Typography variant="body2" sx={{ margin: 2 }}>
                            Predicted energy consumption in the next 24 hours:
                          </Typography>
                        )}
                        <Typography variant="body2" sx={{ margin: 2 }}>
                          Total consumption: {totalConsumption} kWh <br />
                          Total price for consumed energy:{" "}
                          {(totalPrice / 100).toFixed(2)} euros
                        </Typography>
                        {optimizedConsumption.length !== 24 && (
                          <BarChart
                            dataset={consumptionData}
                            yAxis={[{ label: "kWh" }]}
                            xAxis={[
                              {
                                scaleType: "band",
                                dataKey: "hour",
                                label: "time (h)",
                              },
                            ]}
                            series={[
                              {
                                dataKey: "value",
                                label: "consumption (kWh)",
                                color: "#59cae3",
                              },
                            ]}
                            width={450}
                            height={350}
                          />
                        )}
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  } 
  // else {
  //   return <NotFoundPage />;
  // }
};

export default EnergyComponentPage;
