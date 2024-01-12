import styled from "styled-components";

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-size: 200% 200%;
  background-image: linear-gradient(
    to top right,
    red 50%,
    ${(props) => (props.disabled ? "gray" : "white")} 50%
  );
  background-repeat: no-repeat;
  background-position: ${(props) => (props.active ? "0 100%" : "100% 0")};
  background-clip: text;
  transition: background-position 2s;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  color: ${(props) => (props.disabled ? "gray" : "white")};

  h1.blocky-title {
    font-size: 2em; /* Adjust the size as needed */
    font-weight: bold;
    text-transform: uppercase;
    display: inline-block;
    letter-spacing: 4px; /* Adjust the spacing as needed */
    outline: 2px solid white; /* Adjust the outline properties as needed */
    padding: 0.5em; /* Adjust the padding as needed */

    &.bebas-neue {
      font-family: "Bebas Neue", sans-serif;
    }
  }
`;

export const StlyedSearchButton = styled.button`
  margin: 1em 0;
  padding: 0.5em 1em;
  font-size: 1.2em;
  font-weight: bold;
  text-transform: uppercase;
  border: 2px solid
    ${(props) => (props.active ? "red" : props.disabled ? "gray" : "white")};
  background-color: black;
  color: ${(props) =>
    props.active ? "red" : props.disabled ? "gray" : "white"};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;

  :hover {
    color: ${(props) => (props.disabled ? "gray" : "red")};
    border-color: ${(props) => (props.disabled ? "gray" : "red")};
  }
`;
