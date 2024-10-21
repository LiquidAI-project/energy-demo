import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import EnergyQuery from "./energyQuery/EnergyQuery";

const ServiceProvider = React.forwardRef((props, serviceProviderRef) => {
  const { onClick } = props;

  return (
    <div>
      <Box>
        <EnergyQuery onClick={onClick} />
      </Box>
    </div>
  );
});

ServiceProvider.displayName = "ServiceProvider";

ServiceProvider.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ServiceProvider;
