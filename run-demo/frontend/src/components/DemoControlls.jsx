import { Button } from "@mui/material";
import { fetchData,fetchPostData } from "../services/apiService";

const DemoControlls = () => {
  const handleStart = async () => {
    try {
      const response = await fetchData("/file/manifest");

      // Loop through all the responses
      response.forEach((deploymentObj, index) => {
        console.log(`Processing deployment ${index} with ID: ${deploymentObj._id}`);
        wasmModuleDeployment(deploymentObj);
    });
    } catch (error) {
      console.error("Error fetching manifests when starting the demo:", error);
    }
  };

  const wasmModuleDeployment = async (deploymentObj) => {
    try {
        const response = await fetchPostData(`/file/manifest/${deploymentObj._id}`, JSON.stringify(deploymentObj));
        console.log("Anthima", response);
      } catch (error) {
        console.error("Error when deploying wasm modules:", error);
      }
  };
  return (
    <div>
      <Button variant="contained" color="primary" sx={{ mr: 4 }} onClick={handleStart}>
        Start
      </Button>
      <Button variant="contained" color="primary">
        Next
      </Button>
    </div>
  );
};

export default DemoControlls;
