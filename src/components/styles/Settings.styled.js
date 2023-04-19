import styled from "styled-components";

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0;
  z-index: 11;
`;

export const StyledButton = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 0;
  font-size: 3vw;
  background: none;
  border: none;
  color: white;
  margin: 0;
  transform-origin: 0% 100%;
  rotate: -90deg;

  :hover {
    text-decoration: underline;
  }
`;

export const StyledSettings = styled.div`
  position: fixed;
  width: 20vw;
  height: 60vw;
  background-color: red;
  top: -30vw;
  left: 65%;
  transform-origin: 100% 50%;
  rotate: ${(props) => (props.displaySettings ? "0deg" : "83deg")};
  z-index: 10;
  box-shadow: ${(props) => (props.displaySettings ? "10px 10px" : "5px 0px")};
  transition: rotate 0.35s ease, box-shadow 0.35s ease;
`;

export const StyledOptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  position: absolute;
  left: 0;
  top: 50%;
  width: 80%;
  height: 30%;
`;
