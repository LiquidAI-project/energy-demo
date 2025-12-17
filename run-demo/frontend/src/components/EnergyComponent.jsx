import { Card, CardContent, Typography } from "@mui/material";
import ComputerIcon from '@mui/icons-material/Computer';
import PropTypes from 'prop-types';

const EnergyComponent = (props) => {
  const {
    // id,
    name,
    type,
    description,
    isActive,
    deviceInfo,
    supervisorName,
    children
  } = props;

  return (
    <Card
      sx={{
        maxWidth: "500px",
        minWidth: "250px",
        minHeight: "20%",
        padding: "0.5vh",
      }}
    >
      <CardContent sx={{ margin: 0 }}>
        {type === "consumer" && (
          <>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              <strong>{name}</strong> (Energy consumer)
              <br />
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 1 }}>
              {description}
              <br />
            </Typography>
          </>
        )}
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          <strong>
            <ComputerIcon
              fontSize="small"
              style={{ verticalAlign: "middle", marginRight: "4px" }}
            />
            Supervisor: </strong>{supervisorName}
          <br />
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          <strong>{isActive ? "✅ Active" : "⛔ Inactive"}</strong>
          <br />
        </Typography>
        <Typography variant="body2">
          <strong>🔵 Module deployed: </strong> {deviceInfo !== undefined && deviceInfo.isActive && deviceInfo.existingModuleName ? deviceInfo.existingModuleName : "None"}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
};

EnergyComponent.propTypes = {
  // id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['consumer', 'producer']),
  description: PropTypes.string,
  isActive: PropTypes.bool,
  deviceInfo: PropTypes.shape({
    isModuleActive: PropTypes.bool,
    existingModuleName: PropTypes.string,
  }).isRequired,
  supervisorName: PropTypes.string.isRequired
};

export default EnergyComponent;
