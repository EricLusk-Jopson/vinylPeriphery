import styled from "styled-components";

export const StyledSearchCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1vw;
  align-content: center;
  justify-content: center;
`;

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-size: 200% 200%;
  background-image: linear-gradient(
    to top right,
    #ca231f 50%,
    ${(props) => (props.disabled ? "gray" : "#aaa")} 50%
  );
  background-repeat: no-repeat;
  background-position: ${(props) => (props.active ? "0 100%" : "100% 0")};
  background-clip: text;
  transition: background-position 2s;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;

  color: ${(props) => (props.disabled ? "gray" : "#aaa")};

  h1.blocky-title {
    font-size: 2em; /* Adjust the size as needed */
    font-weight: bold;
    text-transform: uppercase;
    display: inline-block;
    letter-spacing: 4px; /* Adjust the spacing as needed */
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
    ${(props) => (props.active ? "#CA231F" : props.disabled ? "gray" : "#aaa")};
  background-color: black;
  color: ${(props) =>
    props.active ? "#CA231F" : props.disabled ? "gray" : "#aaa"};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s, border-color 0.3s, color 0.3s;

  :hover {
    color: ${(props) => (props.disabled ? "gray" : "#CA231F")};
    border-color: ${(props) => (props.disabled ? "gray" : "#CA231F")};
  }
`;
