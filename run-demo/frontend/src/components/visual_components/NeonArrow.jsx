export default function NeonArrow() {
  return (
    <>
      <style>{`
        .arrow-container {
          position: relative;
          width: 100px;
          height: 140px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .arrow-segment {
          position: absolute;
          width: 28px;
          height: 28px;
          opacity: 0;
          transform: translateY(0);
          filter: drop-shadow(0 0 8px rgba(241, 202, 27, 0.7));
          animation: segmentAnim 1.5s linear infinite;
        }

        .seg1 { opacity: 1}   /* light */
        .seg2 { animation-delay: 0.20s; }
        .seg3 { animation-delay: 0.40s; }
        .seg4 { animation-delay: 0.55s;}

        @keyframes segmentAnim {
          0%   { opacity: 0; }
          15%  { opacity: 1; }
          40%  { opacity: 1; }
          70%  { opacity: 0; }
          100% { opacity: 0; }
        }

        .arrow-svg {
          width: 100%;
          height: 100%;
        }
      `}</style>

      <div className="arrow-container">
        <div className="arrow-segment seg1" style={{ bottom: "0px" }}>
          <ArrowSVG stroke="rgba(255,200,150,1)" />
        </div>
        <div className="arrow-segment seg2" style={{ bottom: "20px" }}>
          <ArrowSVG stroke="rgba(255,170,80,1)" />
        </div>
        {/*<div className="arrow-segment seg3" style={{ bottom: "38px" }}>
          <ArrowSVG stroke="rgb(235, 141, 58)" />
        </div>*/}
      </div>
    </>
  );
}

function ArrowSVG({ stroke }) {
  return (
    <svg className="arrow-svg" viewBox="0 0 24 24">
      <polygon
        points="12,3 21,14 3,14"
        stroke={stroke}
        strokeWidth="2.8"
        fill={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}