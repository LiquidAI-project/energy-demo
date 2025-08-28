import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import PropTypes from "prop-types";

function MovingIcon({ deployment, paused }) {
  const controls = useAnimation();
  // Use the initial icon from the deployment
  const [icon, setIcon] = useState(deployment.iconSource);

  const [currentPos, setCurrentPos] = useState({
    x: deployment.startPos.x - 30,
    y: deployment.startPos.y - 30,
  });

  const startTimeRef = useRef(null);
  const duration = 5 * 1000; // 5 seconds in ms

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

  useEffect(() => {
    if (!paused) {
      const start = performance.now();
      startTimeRef.current = start;

      controls.start({
        x: deployment.endPos.x - 30,
        y: deployment.endPos.y - 30,
        transition: { type: "spring", duration: 5, ease: "linear" },
      });
    } else {
      controls.stop();
      controls.set(currentPos);
    }
  }, [paused]);

  return (
    <motion.div
      key={deployment.id}
      initial={currentPos} // Center the animation object
      animate={controls}
      transition={{ type: "spring", duration: 5 }}
      style={{
        position: "absolute",
        zIndex: 1,
      }}
      onUpdate={(latest) => setCurrentPos(latest)}
    >
      <img
        src={icon}
        alt="Moving object"
        style={{
          width: "60px",
          height: "60px",
        }}
      />
    </motion.div>
  );
}

MovingIcon.propTypes = {
  deployment: PropTypes.shape({
    id: PropTypes.string.isRequired,
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
  paused: PropTypes.bool.isRequired
};

export default MovingIcon;