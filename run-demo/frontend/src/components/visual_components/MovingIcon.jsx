import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

function MovingIcon({ deployment }) {
  // Use the initial icon from the deployment
  const [icon, setIcon] = useState(deployment.iconSource);

  useEffect(() => {
    let halfwayTimer;

    // Only set a timer to change the icon if changingIconSource is provided
    if (deployment.changingIconSource) {
      halfwayTimer = setTimeout(() => {
        setIcon(deployment.changingIconSource);
      }, 1200);
    }

    return () => clearTimeout(halfwayTimer);
  }, [deployment.changingIconSource]);

  return (
    <motion.div
      key={deployment.id}
      initial={{
        x: deployment.startPos.x - 20,
        y: deployment.startPos.y - 20,
      }} // Center the animation object
      animate={{
        x: deployment.endPos.x - 20,
        y: deployment.endPos.y - 20,
      }}
      transition={{ type: "spring", duration: 5 }}
      style={{
        position: "absolute",
        zIndex: 1,
      }}
    >
      <img
        src={icon}
        alt="Moving object"
        style={{
          width: "40px",
          height: "40px",
        }}
      />
    </motion.div>
  );
}

MovingIcon.propTypes = {
  deployment: PropTypes.shape({
    id: PropTypes.number.isRequired,
    iconSource: PropTypes.string.isRequired,
    changingIconSource: PropTypes.string,
    startPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
    endPos: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};

export default MovingIcon;
