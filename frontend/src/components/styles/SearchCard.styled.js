import styled from "styled-components";

export const StyledContent = styled.div`
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
`;

export const StlyedSearchButton = styled.button`
  margin: 1em 0;
  background-color: ${(props) =>
    props.active ? "red" : props.disabled ? "gray" : "white"};

  :hover {
    background-color: ${(props) => (props.disabled ? "gray" : "red")};
  }
`;
