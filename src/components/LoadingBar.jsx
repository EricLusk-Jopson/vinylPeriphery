import React from "react";
import { StyledLetter, StyledLoadingBar } from "./styles/LoadingBar.styled";

const LoadingBar = ({ isLoading, isComplete, text }) => {
  return (
    <StyledLoadingBar className="loading-bar">
      {text.split("").map((letter, i) => (
        <StyledLetter isLoading={isLoading} isComplete={isComplete} delay={i}>
          {letter}
        </StyledLetter>
      ))}
    </StyledLoadingBar>
  );
};

export default LoadingBar;
