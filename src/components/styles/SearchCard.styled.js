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
  justify-content: center;
  align-items: center;
  width: 200px;
  height: 300px;
  margin: 40px;
  border-radius: 8px;
  background-image: linear-gradient(
    var(--rotate),
    ${(props) => {
      console.log({ ...props });
      return tinycolor(props.color).darken(10);
    }},
    ${(props) => props.color} 44%,
    ${(props) => tinycolor(props.color).lighten(10)}
  );
  animation: ${rotate} 5s linear infinite;
`;

export const StyledSearchCard = styled.div`
  background: #191c29;
  width: 98%;
  height: 99%;
  border-radius: 8px;
  justify-content: flex-end;
  align-items: center;
  text-align: center;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 20% 50% 30%;
  font-size: 1em;
  cursor: pointer;

  .title-hover {
    grid-area: 1 / 1 / span 1 / span 1;
    opacity: 0;
    transition: 1s;
  }

  .title {
    grid-area: 2 / 1 / span 1 / span 1;
    transition: 1s;
  }

  &:hover .title {
    opacity: 0;
  }

  &:hover .title-hover {
    opacity: 1;
  }

  .body {
    grid-area: 2 / 1 / span 1 / span 1;
  }

  &:hover p {
    color: rgb(88, 199, 250, 1);
  }

  p {
    font-size: 0.8rem;
    color: rgb(88, 199, 250, 0);
    transition: 1s;
  }

  h1 {
    color: rgb(88, 199, 250, 1);
    transition: 0.3s;
  }

  button {
    grid-area: 3 / 1 / span 1 / span 1;
    margin: 20px 5px;
    color: ${(props) => props.color};
    background: none;
    height: 40px;
    border-radius: 8px;
    margin: 0px 15px;
    transition: 0.3s;
  }

  button:hover {
    background: ${(props) => props.color};
    color: #fff;
  }
`;
