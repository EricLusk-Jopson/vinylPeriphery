import styled, { keyframes } from "styled-components";
import tinycolor from "tinycolor2";

const rotate = keyframes`
0% {
    --rotate: 0deg;
  }
  100% {
    --rotate: 360deg;
  }
`;

export const BorderCard = styled.div`
  @property --rotate {
    syntax: "<angle>";
    initial-value: 132deg;
    inherits: false;
  }

  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  height: 300px;
  margin: 40px;
  border-radius: 8px;
  background-image: linear-gradient(
    var(--rotate),
    ${(props) => tinycolor(props.color).darken(10)},
    ${(props) => props.color} 44%,
    ${(props) => tinycolor(props.color).lighten(10)}
  );
  animation: ${rotate} 5s linear infinite;
`;

export const StyledSearchCard = styled.div`
  background: #191c29;
  position: relative;
  width: 98%;
  height: 99%;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  padding: none;

  .title {
    position: absolute;
    top: 30%;
    left: 5%;
    width: 90%;
    height: 20%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.4s;
    transition-delay: 0.4s;
  }

  .body {
    position: absolute;
    top: 20%;
    left: 5%;
    width: 90%;
    height: 20%;
  }

  &:hover .title {
    top: 0%;
    transition: all 0.6s;
    transition-delay: 0s;
  }

  &:hover p {
    color: rgb(88, 199, 250, 1);
    transition-delay: 0.4s;
  }

  p {
    font-size: 0.9rem;
    color: rgb(88, 199, 250, 0);
    transition: 0.6s;
    transition-delay: 0s;
  }

  h1 {
    color: rgb(88, 199, 250, 1);
    margin: 0;
  }

  button {
    position: absolute;
    bottom: 7%;
    left: 5%;
    height: 15%;
    width: 90%;
    color: ${(props) => props.color};
    padding: none;
    background: none;
    border-radius: 8px;
    transition: 0.3s;
  }

  button:hover {
    background: ${(props) => props.color};
    color: #fff;
  }
`;
