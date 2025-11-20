import React from 'react';
import { motion } from 'framer-motion';
import carImage from "../../assets/car.png";
import carChargerImage from "../../assets/car_charger.png";
import { useDemoVisualizationContext } from '../../context/demoVisualizationContext/useDemoVisualizationContext';
import NeonArrow from "./NeonArrow";
import EnergyMovingIcon from "../../assets/energy_moving.png";
const ElectricCar1 = React.forwardRef((props, ref) => {

  const { ev1PluggedIn } = useDemoVisualizationContext();


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
          zIndex: 5, // ensure car is above lines
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
          initial={{ y: props.isMainViewActive && ev1PluggedIn ? 0 : '100vh' }}
          animate={{ y: ev1PluggedIn ? 0 : '100vh' }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
          }}
        >
          {/* Circular Glow behind the car */}

          {ev1PluggedIn && <motion.div
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
        </motion.div>


        {ev1PluggedIn && <img
          src={EnergyMovingIcon}
          alt="Energy Moving"
          style={{
            position: "absolute",
            top: "4%",
            left: "38%",
            transform: "translateX(-50%)",
            width: "32px",
            height: "32px",
            zIndex: 3,
          }}
        />}

        {/*  <motion.div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              top: "-25%",
              left: "-25%",
              transform: "translate(-50%, -50%)",
              width: "150%",            // larger than car for nice soft fade
              height: "150%",
              borderRadius: "50%",      // 🔥 makes glow circular
              pointerEvents: "none",
              zIndex: -1,
              background: `radial-gradient(
        circle,
        rgba(215, 113, 41, 0.55) 0%,
        rgba(255, 117, 5, 0.35) 30%,
        rgba(227, 92, 58, 0.15) 60%,
        rgba(233, 66, 20, 0) 80%
      )`,
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={
              ev1PluggedIn
                ? {
                  opacity: [0, 1, 0],
                  scale: [0.4, 1.2, 0.4],   // ✨ FIXED — return to small size
                }
                : { opacity: 0, scale: 0.4 }
            }

            transition={{
              duration: 3,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 0.4,
            }}
          />

          <img
            src={carImage}
            alt="ElectricCar1"
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              zIndex: 1,
            }}
          />

          <img
            src={EnergyMovingIcon}
            alt="Energy Moving"
            style={{
              position: "absolute",
              top: "-18%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "32px",
              height: "32px",
              zIndex: 3,
            }}
          />

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
