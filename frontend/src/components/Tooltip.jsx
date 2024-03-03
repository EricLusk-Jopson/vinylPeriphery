import React, { useState } from "react";
import {
  StyledTooltipContainer,
  StyledTooltipContents,
} from "./styles/Tooltip.styled";

const Tooltip = ({ title, children }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  const handleMouseEnter = () => {
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
  };

  return (
    <StyledTooltipContainer
      className="custom-tooltip-container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {title && isTooltipVisible && (
        <StyledTooltipContents className="custom-tooltip">
          {title}
        </StyledTooltipContents>
      )}
    </StyledTooltipContainer>
  );
};

export default Tooltip;
