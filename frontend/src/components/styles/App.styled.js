import styled from "styled-components";

export const StyledApp = styled.div`
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  font-family: Monda;
`;

export const StyledUpperSeach = styled.div`
  background-color: #111;
  position: relative;
  height: 50vh;
  display: flex;
  flex-direction: row;
`;

export const StyledInputBlock = styled.div`
  display: flex;
  flex-direction: column-reverse;
  flex-grow: 1;
  align-items: center;
  justify-content: end;
  margin-bottom: 60px;
`;

export const StyledLowerSearch = styled.div`
  min-height: 50vh;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  background-color: black;
  color: white;
  padding-top: 3px;
  box-sizing: border-box;
  overflow-y: auto;
`;

export const StyledSearchCarousel = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: center;
  width: 100%;
`;
