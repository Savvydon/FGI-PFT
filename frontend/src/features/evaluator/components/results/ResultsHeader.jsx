import React from "react";
import fgiLogo from "../../../../assets/fgiLogo.svg";

export default function Header() {
  return (
    <div className="header">
      <img src={fgiLogo} alt="FGI Logo" className="naf-logo" />
      <h2>
        FITNESS GUIDE INTERNATIONAL PHYSICAL FITNESS TEST RESULT INTERPRETATION
      </h2>
    </div>
  );
}
