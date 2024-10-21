import { Box } from "@mui/material";
import { useState, useEffect } from "react";

function getDayName(date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayName = days[date.getDay()];
  return dayName;
}

function RealtimeClock() {
  let [time, setTime] = useState(new Date());

  let hh = time.getHours();
  let mm = time.getMinutes();
  let ss = time.getSeconds();

  if (hh < 10) {
    hh = "0" + hh;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (ss < 10) {
    ss = "0" + ss;
  }

  const realtime = hh + ":" + mm + ":" + ss;

  useEffect(() => {
    setInterval(() => setTime(new Date()), 1000);
  }, []);

  return (
    <Box style={{ paddingBottom: "7px" }}>
      <b style={{ fontWeight: "normal" }}>Real time: </b>
      {realtime}, {getDayName(time)} {time.getDate()}.{time.getMonth() + 1}.
      &#x1F4C5;
    </Box>
  );
}

export default RealtimeClock;
