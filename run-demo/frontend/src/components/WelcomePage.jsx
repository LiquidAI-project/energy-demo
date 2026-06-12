import { Box, Typography, Button } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/water.jpg";

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

const WelcomePage = () => {
  const navigate = useNavigate();
  const isDevVersion = import.meta.env.VITE_DEV_VERSION === 'true';

  return (
    <div className="welcome">
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

      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "100%",
          height: "100vh",
          position: "relative",
          zIndex: 0,
        }}
      >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                display: "flex",
                transform: "translate(-50%, -50%)",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                background: "rgba(255, 255, 255, 0.9)",
                textAlign: "center",
                zIndex: 2,
                border: "1px solid #DCDCDC",
                borderRadius: "5px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography variant="h4" sx={{ margin: 2, fontWeight: "bold" }}>
                {isDevVersion ? (
                  <>
                    Welcome to the <span style={{ color: 'red' }}>development version</span> of the Energy Demo with LiquidAI
                  </>
                ) : (
                  "Welcome to the Energy Demo with LiquidAI"
                )}
              </Typography>
              <Typography
                variant="text"
                sx={{ margin: 2, fontWeight: "bold", fontSize: 18 }}
              >
                Experience the power of liquid software with intelligent energy
                optimization
              </Typography>
              <Typography variant="text" sx={{ margin: 2, fontSize: 18 }}>
                This demo shows you how energy consumption can be optimized in a
                single-family house
                <br />
                <br />
                You can read more about liquid software{" "}
                <a
                  href="https://webpages.tuni.fi/liquid/"
                  style={{ color: "black" }}
                >
                  here
                </a>
                <br />
                <br />
                This project is licensed under MIT. For more info and
                documentation, take a look in{" "}
                <a
                  href="https://github.com/LiquidAI-project/energy-demo"
                  style={{ color: "black" }}
                >
                  Git
                </a>
              </Typography>

              <ThemeProvider theme={theme}>
                <Button
                  variant="contained"
                  color="water"
                  sx={{ borderRadius: 2 }}
                  onClick={() => navigate("/demo")}
                >
                  Start
                </Button>
              </ThemeProvider>

              <Typography variant="body2" sx={{ margin: 2, color: "black" }}>
                <a
                  href="https://www.freepik.com/free-photo/blue-swimming-pool-rippled-water-detail_1238770.htm"
                  rel="noreferrer"
                  style={{ color: "black" }}
                >
                  Image by benzoix
                </a>{" "}
                on Freepik
              </Typography>
            </Box>
      </div>
    </div>
  );
};

export default WelcomePage;
