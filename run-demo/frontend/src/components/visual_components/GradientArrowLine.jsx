import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import EnergyMovingIcon from '../../assets/energy_moving.png';

const GradientArrowLine = () => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Measure container width for motion
  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        top: '-10px',
        left: 0,
        width: '100%',
        height: '30px',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          {/* Gradient for the arrow line */}
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFF00" /> {/* yellow */}
            <stop offset="50%" stopColor="#FFA500" /> {/* orange */}
            <stop offset="100%" stopColor="#008000" /> {/* reddish-orange */}
          </linearGradient>

          {/* Arrow pattern */}
          <pattern id="arrowPattern" x="0" y="0" width="8" height="30" patternUnits="userSpaceOnUse">
            <path d="M 0 5 L 6 15 L 0 25" fill="none" stroke="white" strokeWidth="3" />
          </pattern>

          {/* Mask for arrows */}
          <mask id="arrowMask">
            <rect x="0" y="0" width="100%" height="100%" fill="black" />
            <rect x="0" y="0" width="100%" height="100%" fill="url(#arrowPattern)" />
          </mask>

          {/* Glow effect */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base gray arrows */}
        <rect x="0" y="0" width="100%" height="100%" fill="#808080" mask="url(#arrowMask)" />

        {/* Animated gradient fill */}
        {containerWidth > 0 && (
          <motion.rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            fill="url(#lineGradient)"
            mask="url(#arrowMask)"
            style={{ overflow: 'visible' }}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}   // start fully hidden (right side hidden)
            animate={{ clipPath: 'inset(0 0% 0 0)' }}      // reveal full width
            transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
          />

        )}
      </svg>

      {/* Energy icon moving along the line */}
      {containerWidth > 0 && (
        <motion.img
          src={EnergyMovingIcon}
          alt="Energy Moving"
          style={{
            position: 'absolute',
            // top: '-1px', // align with line
            left: 0,
            width: '28px',
            height: '28px',
            zIndex: 999,
            pointerEvents: 'none',
            transform: "rotate(90deg)"
          }}
          animate={{ x: [0, containerWidth - 28] }}
          transition={{
            duration: 2, // same as gradient fill
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
};

export default GradientArrowLine;