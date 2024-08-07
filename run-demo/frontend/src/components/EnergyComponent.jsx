import { Card, CardContent, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const EnergyComponent = (props) => {
  const {
    id,
    name,
    type,
    description,
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
          <strong>✅ Active</strong>
          <br />
        </Typography>
        <Typography variant="body2">
          <strong>🔵 Module deployed - </strong> None
        </Typography>
      </CardContent>
    </Card>
  );
};

EnergyComponent.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['consumer', 'producer']),
  description: PropTypes.string,
};

export default EnergyComponent;
