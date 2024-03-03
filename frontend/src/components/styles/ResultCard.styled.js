import styled from "styled-components";

export const StyledResultsSection = styled.section`
  min-height: 10vh;
  background-color: black;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledResults = styled.div`
  width: ${(props) => (props.isMobileView ? "95vw" : "70%")};
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledMessage = styled.div`
  width: 100%;
  height: 10vh;
  font-size: 1em;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: #ccc;
`;

export const StyledLoadButton = styled.button`
  border: none;
  background-color: unset;
  color: white;
  font-size: 1em; /* Correct property name */
  padding: 0;
  margin: 0px 20px;
  ${(props) => props.disabled && "color: gray;"}
`;

export const StyledSelectorContainer = styled.div`
  color: white;
  display: flex;
  flex-wrap: wrap;
  ${(props) => props.reverse && "justify-content: flex-end;"}
  gap: 15px;
  border-${(props) => props.border}: 5px solid #210303;
  margin: 30px;
  padding: 0px 15px;
  width: 100%;
`;

export const StyledSelector = styled.button`
  font-family: "Monda"
  font-size: 1.2rem;
  font-weight: 700;
  padding: 0.7em;
  border: 2px solid;
  border-radius: 2px;
  color: #222;
  background-color: #120101;
  border-color: #222;
  outline: none;
  cursor: pointer;
  ${(props) =>
    props.selected &&
    `border-color: #851714; 
     color: #aaa;
     background-color: #1f0303;
  `}
  ${(props) =>
    props.disabled &&
    `border-color: #222; 
     color: #222;
     background-color: black;
     cursor: default;
  `}
  

  &:hover {
    ${(props) =>
      !props.disabled &&
      `color: #ccc;
      background-color: #360505;
    `}
  }
`;

export const StyledResultCard = styled.div`
  width: 90%;
  margin: 10px 0px;
  color: white;
  border-bottom: 1px solid white;
  word-wrap: break-word;
`;

export const StyledHeader = styled.div`
  display: grid;
  grid-template-columns: 60% 20% 20% 10%;
  grid-template-rows: auto auto; /* Use 'auto' for responsive height */
  align-items: center;
  padding: 0px 20px;
  ${(props) =>
    props.isOpen &&
    `color: #CA231F;
  background: radial-gradient(#070000, #000000);`}
  transition: color 0.5s;
  transition: background 0.3s color 0.5s;

  &:hover {
    background: radial-gradient(#070000, #000000);
  }
`;

export const H1 = styled.h1`
  display: inline;
  overflow: hidden;
  max-width: 80%;
  white-space: nowrap; /* Prevent text from wrapping */
  text-overflow: ellipsis; /* Use ellipsis for overflowed text */
`;

export const Icon = styled.span`
  font-size: 1.5rem;
`;

export const StyledBody = styled.div`
  padding: 0px 20px;
  height: fit-content;
`;
