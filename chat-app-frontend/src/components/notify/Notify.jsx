import { BellIcon } from "@chakra-ui/icons";
import React from "react";

function Notify({ count }) {
  const notyIconStyle = {
    position: "relative",
    display: "inline",
  };

  const notyNumStyle = {
    position: "absolute",
    right: "0",
    backgroundColor: "rgb(180, 60, 60)",
    fontSize: "10px",
    color: "white",
    display: "inline",
    padding: "2px 5px",
    borderRadius: "20px",
  };

  return (
    <div>
      <div style={notyIconStyle}>

        {count > 0 ? <div style={notyNumStyle}>{count}</div> : null}

        <BellIcon fontSize={"3xl"} m={"1"} />
      </div>
    </div>
  );
}

export default Notify;
