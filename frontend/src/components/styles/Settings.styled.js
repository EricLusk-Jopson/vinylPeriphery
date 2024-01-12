import styled from "styled-components";

export const ButtonWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 0;
  z-index: 11;
  color: #fff;
  height: 30vh;
  width: 10%;
`;

export const StyledButton = styled.div`
  position: absolute;
  bottom: 0;
  white-space: nowrap; /* Prevent text from wrapping */
  font-size: max(2.5vw - 3px, 25px - 3px);
  transform-origin: left bottom;
  transform: rotate(-90deg) translateY(100%);
  font-family: "Bebas Neue";

  :hover {
    text-decoration: underline;
  }
`;

export const StyledSelect = styled.select`
  border: 2px solid black;
  border-radius: 2px;
  background-color: #ca231f;
  color: black;
`;

export const StyledOption = styled.option`
  background-color: #ca231f;
  color: black;

  :hover {
    background-color: #fff;
    color: black;
  }
`;

export const StyledSettings = styled.div`
  position: fixed;
  min-width: 250px;
  width: 25vw;
  height: 80vh;
  background-color: #ca231f;
  top: -35vh;
  right: 10%;
  transform-origin: 100% calc(43.75% + max(25px, 2.5vw));
  rotate: ${(props) => (props.displaySettings ? "0deg" : "90deg")};
  z-index: 10;
  box-shadow: ${(props) => (props.displaySettings ? "10px 10px" : "5px 0px")};
  transition: rotate 0.35s ease, box-shadow 0.35s ease;
`;

export const StyledOptionsContainer = styled.div`
  position: absolute;
  width: 80%;
  height: 55%;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Enable vertical scrolling if content overflows */
  padding: 10px; /* Adjust padding as needed */
  font-family: "Arial";
`;

export const StyledSettingGroup = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0px;
`;
