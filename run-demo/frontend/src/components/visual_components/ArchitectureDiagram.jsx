import React from "react";
// If using Material-UI:
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import DatabaseImg from '../../assets/database.png';
import OrchestratorImg from '../../assets/orchestrator.png';
import IntelligenceControlImg from '../../assets/intelligent_control.jpg';
import FreezerImg from '../../assets/freezer.png';
import WashingMachineImg from '../../assets/washing_machine.png';
import EVChargerImg from '../../assets/ev_charger.png';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import { useState, useEffect } from 'react';

// Simple Arrow SVG component (straight arrow, can be enhanced)
const Arrow = ({ style }) => (
  <svg width="80" height="40" style={style}>
    <line x1="10" y1="10" x2="70" y2="30" stroke="#1a4d6b" strokeWidth="4" markerEnd="url(#arrowhead)" />
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#1a4d6b" />
      </marker>
    </defs>
  </svg>
);

export default function ArchitectureDiagram() {
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [hasData, setHasData] = useState(false);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasData(true);
      setLoading(false);
      setExpanded(true); // auto-expand when data is loaded
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box p={4} pt={6} bgcolor="#fcf3f7" width="100%" minHeight="700px">
      {/* Server-side */}
      <Grid container justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 6 }}>
        <Grid item sx={{ pr: 0 }}>
          <img src={DatabaseImg} alt="MongoDB Database" style={{ width: 120, height: 120, objectFit: "contain", verticalAlign: 'middle' }} />
        </Grid>
        <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display:'flex', alignItems:'center' }}>
          <svg width="150px" height="64px" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
            <defs>
              <marker
                id="arrowheadLeft"
                markerWidth="7"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
              </marker>
              <marker
                id="arrowheadRight"
                markerWidth="7"
                markerHeight="7"
                refX="5.5"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="0 0, 7 3.5, 0 7" fill="#094C7A" />
              </marker>
            </defs>
            <line
              x1="11"
              y1="17"
              x2="140"
              y2="17"
              stroke="#094C7A"
              strokeWidth="1.5"
              markerStart="url(#arrowheadLeft)"
              markerEnd="url(#arrowheadRight)"
            />
            <text
                x="75"
                y="10"
                textAnchor="middle"
                fontSize="9"
                fill="#094C7A"
                fontFamily="monospace"
            >
                Reads/Writes data
            </text>
          </svg>
        </Grid>
        <Grid item sx={{ pl: 0, position: 'relative' }}>
      <Box
        sx={{
          p: 2,
          bgcolor: '#888888',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderRadius: 3,
          boxShadow: 3,
          position: 'relative',
          overflow: 'hidden',
          minHeight: 200,
        }}
      >
        {/* --- Loading overlay --- */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              borderRadius: 3,
            }}
          >
            <CircularProgress size={40} sx={{ color: '#fff' }} />
          </Box>
        )}

        {/* --- Main content --- */}
        <img
          src={OrchestratorImg}
          alt="Orchestrator"
          style={{
            width: '90%',
            maxWidth: 80,
            height: 'auto',
            objectFit: 'contain',
            marginBottom: 8,
          }}
        />
        <Typography align="center" color="#fff">
          Orchestrator
        </Typography>

        {expanded && hasData && (
          <>
            <Typography color="#fff" align="left" sx={{ mt: 1 }}>
              Modules:
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: '#f6f6f6',
                width: '100%',
                borderRadius: 1,
                p: 1,
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                fontFamily="monospace"
              >
                Fibo
                <br />
                Camera
              </Typography>
            </Box>

            <Typography color="#fff" sx={{ mt: 1 }}>
              Deployments:
            </Typography>
            <Box
              sx={{
                maxHeight: 200,
                overflow: 'auto',
                bgcolor: '#f6f6f6',
                width: '100%',
                borderRadius: 1,
                p: 1,
              }}
            >
              <Typography
                variant="body2"
                color="textSecondary"
                fontFamily="monospace"
              >
                FiboDep1
              </Typography>
            </Box>
          </>
        )}

        <IconButton
          size="small"
          onClick={() => hasData && setExpanded((e) => !e)}
          disabled={!hasData}
          sx={{
            mt: 1,
            color: hasData ? '#fff' : '#aaa',
            background: 'transparent',
            alignSelf: 'center',
          }}
        >
          <ExpandMoreIcon
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </IconButton>
      </Box>
    </Grid>
        {/* <Grid item sx={{ pl: 0 }}>
          <Box sx={{ p: 2, bgcolor: "#888888", display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 3, boxShadow: 3 }}>
            <img src={OrchestratorImg} alt="Orchestrator" style={{ width: '90%', maxWidth: 80, height: 'auto', objectFit: 'contain', marginBottom: 8 }} />
            <Typography align="center" color="#fff">Orchestrator</Typography>
            {expanded && hasData && (
                <>
                 <Typography color="#fff" align="left" sx={{mt: "1"}}>Modules:</Typography>
                 <Box sx={{ maxHeight: 200, overflow: 'auto',  bgcolor: '#f6f6f6', width: '100%', borderRadius: 1, p: 1 }}>
                     <Typography variant="body2" color="textSecondary" fontFamily="monospace">
                         Fibo<br></br>
                         Camera
                     </Typography>
                 </Box>
                 <Typography color="#fff" sx={{mt: 1}}>Deployments:</Typography>
                 <Box sx={{ maxHeight: 200, overflow: 'auto',  bgcolor: '#f6f6f6', width: '100%', borderRadius: 1, p: 1 }}>
                     <Typography variant="body2" color="textSecondary" fontFamily="monospace">
                         FiboDep1
                     </Typography>
                 </Box>
                 </>
            )}
            <IconButton
              size="small"
              onClick={() => hasData && setExpanded((e) => !e)}
              disabled={!hasData}
              sx={{ mt: 1, color: hasData ? '#fff' : '#aaa', background: 'transparent', alignSelf: 'center' }}
            >
              <ExpandMoreIcon style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </IconButton>
          </Box>
        </Grid> */}
        <Grid item sx={{ px: 0, mx: -2, zIndex: 2, display:'flex', alignItems:'center' }}>
          <svg width="150px" height="64px" style={{ display: 'block', position: 'relative', zIndex: 2 }}>
            <defs>
              <marker
                id="arrowheadLeft2"
                markerWidth="7"
                markerHeight="7"
                refX="7"
                refY="3.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <polygon points="7 0, 7 7, 0 3.5" fill="#094C7A" />
              </marker>
            </defs>
            <line
              x1="18"
              y1="17"
              x2="140"
              y2="17"
              stroke="#094C7A"
              strokeWidth="1.5"
              markerStart="url(#arrowheadLeft2)"
            />
            <text
                x="75"
                y="-10"
                textAnchor="middle"
                fontSize="9"
                fill="#094C7A"
                fontFamily="monospace"
            >
                 <tspan x="75" dy="24">Receives instructions</tspan>
                 <tspan x="75" dy="12">for deployment</tspan>
                 <tspan x="75" dy="12">and execution</tspan>
                 
            </text>
          </svg>
        </Grid>
        <Grid item>
          <img src={IntelligenceControlImg} alt="Intelligence Control" style={{ width: 120, height: 120, objectFit: "contain" }} />
        </Grid>
      </Grid>
      {/* ---- arrows here using <Arrow /> SVGs, position with absolute or margins ---- */}
      {/* Supervisors Section */}
      <Box mt={20} px={8} sx={{ border: 2, borderColor: '#c7c7c7', p: 2, bgcolor: '#f7f7f7' }}>
          <Typography mb={2}>Supervisors</Typography>
          <Grid container spacing={4} justifyContent="center">
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography align="center" sx={{ mb: 1 }}>freezer</Typography>
                <img src={FreezerImg} alt="Freezer" style={{ width: 60, height: 60 }} />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography align="center" sx={{ mb: 1 }}>washing-machine</Typography>
                <img src={WashingMachineImg} alt="Washing Machine" style={{ width: 60, height: 60 }} />
              </Box>
            </Grid>
            <Grid item>
              <Box sx={{ p: 2, bgcolor: "#ad8a29", color: "#fff", borderRadius: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography align="center" sx={{ mb: 1 }}>ev-charger</Typography>
                <img src={EVChargerImg} alt="EV Charger" style={{ width: 60, height: 60 }} />
              </Box>
            </Grid>
          </Grid>
        </Box>
    </Box>
  );
}