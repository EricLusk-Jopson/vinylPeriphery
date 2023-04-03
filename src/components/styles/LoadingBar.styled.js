import styled, { css, keyframes } from "styled-components";

export const StyledLoadingBar = styled.div`
  background-color: black;
  color: white;
  font-weight: bolder;
  flex-grow: 1;
  margin: 0 3%;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;

  p {
    margin: 0;
  }
`;

const colorChange = keyframes`
0% {
    color: white;
  }

50% {
    color: red;
  }

100% {
    color: white;
  }
`;

const anim = css`
  animation: 1s ${colorChange} 0.1s infinite;
`;

const complete = css`
  color: green;
`;

export const StyledLetter = styled.p`
  margin: 0;
  ${(props) => props.isLoading && anim}

  ${(props) => props.isComplete && "color: green;"}
`;
