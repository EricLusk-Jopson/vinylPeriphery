import styled from "styled-components";

export const CoolDownTimer = styled.div`
  height: 2px;
  background-color: ${(props) => (props.coolDown ? "red" : "black")};
  width: ${(props) => (props.coolDown ? "0%" : "100%")};
  opacity: ${(props) => (props.coolDown ? "1" : "0")};
  transition: ${(props) => props.coolDown && "width 60s linear"};
`;
