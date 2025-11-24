import React from 'react';
import { motion } from 'framer-motion';
import carImage from "../../assets/car.png";
import carChargerImage from "../../assets/car_charger.png";
import { useDemoVisualizationContext } from '../../context/demoVisualizationContext/useDemoVisualizationContext';
import EnergyMovingIcon from "../../assets/energy_moving.png";
import Battery20Icon from '@mui/icons-material/Battery20';
import Battery50Icon from '@mui/icons-material/Battery50';
import Battery80Icon from '@mui/icons-material/Battery80';
import BatteryFullIcon from '@mui/icons-material/BatteryFull';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';

const ElectricCar1 = React.forwardRef((props, ref) => {

  const { electricCar1 } = useDemoVisualizationContext();


  return (
    <div>
      <button
        style={{
          position: "absolute",
          top: "55.9%",
          left: "71.5%",
          width: "10%",
          height: "23%",
          backgroundColor: "transparent",
          border: "none",
          padding: "0%",
          zIndex: 5
        }}
      >
        <img
          id="electric-car-1-charger"
          src={carChargerImage}
          alt="ElectricCar1Charger"
          style={{
            width: "30%",
            height: "20%",
          }}
        />

        {/* Animate the car image */}
        {/*  <motion.img
          id="electric-car-1"
          src={carImage}
          alt="ElectricCar1"
          ref={ref}
          style={{
            width: "100%",
            height: "100%",
          }}
          initial={{ y: props.isMainViewActive && ev1PluggedIn ? 0 : '100vh' }} 
          animate={{ y: ev1PluggedIn ? 0 : '100vh' }}  // If ev2PluggedIn is false, move out of the screen
          transition={{
            duration: 3,
            ease: 'easeInOut',
          }}
        /> */}

        <motion.div
          style={{ position: "relative", width: "100%", height: "100%" }}
          initial={{ y: props.isMainViewActive && electricCar1.pluggedIn ? 0 : '100vh' }}
          animate={{ y: electricCar1.pluggedIn ? 0 : '100vh' }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
          }}
        >
          {/* Circular Glow behind the car */}

          {electricCar1.provideEnergy && <motion.div
            style={{
              position: "absolute",
              top: "-25%",
              left: "-25%",
              width: "150%", // size of the glow
              height: "150%",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255, 174, 0, 0.7) 0%, rgba(255, 140, 0, 0.3) 50%, rgba(211, 211, 211, 0) 100%)",
              transform: "translate(-50%, -50%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
            animate={{
              scale: [0.5, 1.2, 0.5], // grow and shrink
              opacity: [0, 0.8, 0],    // fade in and out
            }}
            transition={{
              duration: 3,
              ease: "easeOut",
              repeat: Infinity,
            }}
          />}

          {/* Car Image */}
          <img
            id="electric-car-1"
            src={carImage}
            alt="ElectricCar1"
            ref={ref}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* Battery Charging Indicator */}
          {electricCar1.pluggedIn && (() => {
            const energyLevel = parseInt(electricCar1.totalEnergy) || 0;
            const maxEnergy = 120;
            const percentage = (energyLevel / maxEnergy) * 100;

            let BatteryIcon;
            let color;

            if (percentage >= 90) {
              BatteryIcon = BatteryChargingFullIcon;
              color = "#4caf50"; // green
            } else if (percentage >= 60) {
              BatteryIcon = Battery80Icon;
              color = "#8bc34a"; // light green
            } else if (percentage >= 30) {
              BatteryIcon = Battery50Icon;
              color = "#ffc107"; // amber
            } else {
              BatteryIcon = Battery20Icon;
              color = "#f44336"; // red
            }

            return (
              <div
                style={{
                  position: "absolute",
                  top: "44%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  zIndex: 3
                }}
              >
                <BatteryIcon
                  style={{
                    fontSize: "24px",
                    color: color,
                    marginRight: "4px"
                  }}
                />
                <span style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "#333"
                }}>
                  {energyLevel} kWh
                </span>
              </div>
            );
          })()}
        </motion.div>

        {electricCar1.provideEnergy && <img
          src={EnergyMovingIcon}
          alt="Energy Moving"
          style={{
            position: "absolute",
            top: "4%",
            left: "52%",
            transform: "translateX(-50%)",
            width: "32px",
            height: "32px",
            zIndex: 3
          }}
        />}


        {/*  <motion.div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >

          {/* Neon arrows positioned above the car */}
        {/* <div
            style={{
              position: "absolute",
              top: "-24%",
              left: "10%",
              transform: "translate(-50%, -50%) rotate(-35deg)",
              pointerEvents: "none",
              zIndex: 5,
              width: "140px",
              height: "180px",
            }}
          >
            <NeonArrow />
          </div>
          <div
            style={{
              position: "absolute",
              top: "-28%",
              left: "72%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 5,
              width: "140px",
              height: "180px",
            }}
          >
            <NeonArrow />
          </div>
          <div
            style={{
              position: "absolute",
              top: "-30%",
              //right: "0%",
              transform: "translate(28%, -30%) rotate(35deg)",
              pointerEvents: "none",
              zIndex: 5,
              width: "140px",
              height: "180px",
            }}
          >
            <NeonArrow />
          </div> *
        </motion.div> */}


      </button>
    </div>
  );
});

ElectricCar1.displayName = "ElectricCar1";
export default ElectricCar1;
