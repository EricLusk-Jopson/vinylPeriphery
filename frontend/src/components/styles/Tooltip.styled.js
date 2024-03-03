import styled from "styled-components";

export const StyledTooltipContainer = styled.div`
    position: relative;
    display: inline-block;
  }`;

export const StyledTooltipContents = styled.div`
  position: absolute;
  top: 110%; /* Position below the trigger element */
  left: 50%; /* Center horizontally */
  transform: translateX(-50%); /* Adjust for centering */
  background-color: #222; /* Change the background color */
  color: #ddd; /* Change the text color */
  padding: 4px 6px;
  font-size: 0.8em;
  white-space: nowrap; /* Prevent line breaks in the tooltip */
  box-shadow: 0 8px 15px 10px rgba(0, 0, 0, 0.7);
  z-index: 1;
`;
