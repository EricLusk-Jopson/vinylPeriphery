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
  display: flex;
  flex-direction: column;
  font-size: 1em;
  cursor: pointer;
  color: rgb(88 199 250);

  p {
    display: none;
  }

  h1 {
    margin-bottom: 50%;
  }

  button {
    margin: 20px 5px;
  }

  &:hover p {
    display: inline;
  }

  &:hover h1 {
    display: none;
  }
`;
