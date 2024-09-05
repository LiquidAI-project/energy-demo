import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import Service_Provider from "./../../assets/service_provider.png";
import EnergyQuery from "./energyQuery/EnergyQuery";

const ServiceProvider = React.forwardRef((props, serviceProviderRef) => {

  const { onClick } = props;

  return (
    <div>
      <Box>
        <div
          style={{
            position: "relative",
            marginTop: "50%",
            paddingBottom: "30%",
            width: "100%",
            height: 0,
          }}
        >
          <div
            className="overlay-content"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <img
              src={Service_Provider}
              alt="Service_Provider"
              ref={serviceProviderRef}
              style={{
                position: "absolute",
                top: "4%",
                left: "30%",
                width: "35%",
                zIndex: 2,
              }}
            />
          </div>
        </div>
        <EnergyQuery onClick={onClick}/>
      </Box>
    </div>
  );
});

ServiceProvider.displayName = "ServiceProvider";

ServiceProvider.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ServiceProvider;
