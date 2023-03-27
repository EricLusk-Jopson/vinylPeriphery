import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  z-index: 11;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-content: center;
`;

export const StyledModal = styled.div`
  position: relative;
  font-family: "Exo 2", sans-serif;
  font-weight: 100;
  font-style: italic;
  color: #fff;
  text-transform: uppercase;
  min-height: 200px;
  width: 400px;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.9);
  align-self: center;
  text-align: center;
  font-size: x-large;
  font-weight: 500;
  color: #fff;
  padding: 5%;
`;

export const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
