import styled, { css, keyframes } from "styled-components";

export const StyledLoadingBarWrapper = styled.div`
  width: 40vw;
  display: flex;
  justify-content: space-between;
  padding: 0 1vw;
`;

export const StyledLoadingBar = styled.div`
  background-color: black;
  color: #aaa;
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
    color: #aaa;
  }

50% {
    color: #CA231F
  }

100% {
    color: #aaa;
  }
`;

const anim = css`
  animation: 2s ${colorChange} ${(props) => props.delay * 0.1}s infinite;
`;

export const StyledLetter = styled.p`
  margin: 0;
  ${(props) => props.isLoading && anim}

  ${(props) => props.isComplete && "color: #CA231F"}
`;
