import React from 'react';
import { motion } from 'framer-motion';
import carImage from "../../assets/car.png";
import carChargerImage from "../../assets/car_charger.png";
import { useDemoVisualizationContext } from '../../context/demoVisualizationContext/useDemoVisualizationContext';
import NeonArrow from "./NeonArrow";
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
        
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {/* Animate the car image */}
          <motion.img
            id="electric-car-1"
            src={carImage}
            alt="ElectricCar1"
            ref={ref}
            style={{
              width: "100%",
              height: "100%",
            }}
            initial={{ y: props.isMainViewActive && ev1PluggedIn ? 0 : '100vh' }} 
            animate={{ y: ev1PluggedIn ? 0 : '100vh' }}  // If ev1PluggedIn is false, move out of the screen
            transition={{
              duration: 3,
              ease: 'easeInOut',
            }}
          />
          {/* Neon arrows positioned above the car */}
          <div
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
          </div>
        </div>
      </button>
    </div>
  );
});

ElectricCar1.displayName = "ElectricCar1";
export default ElectricCar1;
