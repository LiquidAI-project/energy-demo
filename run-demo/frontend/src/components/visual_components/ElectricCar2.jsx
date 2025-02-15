import React from 'react';
import { motion } from 'framer-motion';
import carImage from "../../assets/car.png";
import carChargerImage from "../../assets/car_charger.png";
import { useDemoVisualizationContext } from '../../context/demoVisualizationContext/useDemoVisualizationContext';

const ElectricCar2 = React.forwardRef((props, ref) => {

  const { ev2PluggedIn } = useDemoVisualizationContext();

  return (
    <div>
      <button
        style={{
          position: "absolute",
          top: "55.9%",
          left: "83%",
          width: "10%",
          height: "23%",
          backgroundColor: "transparent",
          border: "none",
          padding: "0%",
        }}
      >
        <img
          id="electric-car-2-charger"
          src={carChargerImage}
          alt="ElectricCar2Charger"
          style={{
            width: "30%",
            height: "20%",
          }}
        />
        
        {/* Animate the car image */}
        <motion.img
          id="electric-car-2"
          src={carImage}
          alt="ElectricCar2"
          ref={ref}
          style={{
            width: "100%",
            height: "100%",
          }}
          initial={{ y: 0 }} 
          animate={{ y: ev2PluggedIn ? 0 : '100vh' }}  // If ev2PluggedIn is false, move out of the screen
          transition={{
            duration: 5,
            ease: 'easeInOut',
          }}
        />
      </button>
    </div>
  );
});

ElectricCar2.displayName = "ElectricCar2";
export default ElectricCar2;
