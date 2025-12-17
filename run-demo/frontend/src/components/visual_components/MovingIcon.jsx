import { useEffect, useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import PropTypes from "prop-types";

function MovingIcon({ deployment, paused }) {
  const controls = useAnimation();
  // Use the initial icon from the deployment
  const [icon, setIcon] = useState(deployment.iconSource);

  const isSmallIcon = icon.includes("energy_moving");
  const iconSize = isSmallIcon ? 28 : 60;

  const [currentPos, setCurrentPos] = useState({
    x: deployment.startPos.x - iconSize / 2,
    y: deployment.startPos.y - iconSize / 2,
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
        x: deployment.endPos.x - iconSize / 2,
        y: deployment.endPos.y - iconSize / 2,
        transition: { type: "spring", duration: 5, ease: "linear" },
      });
    } else {
      controls.stop();
      controls.set(currentPos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, iconSize, deployment.endPos]);

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
        style={
          isSmallIcon
            ? { width: "28px", height: "28px" }
            : { width: "60px", height: "60px" }
        }
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