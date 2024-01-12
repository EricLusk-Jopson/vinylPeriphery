import styled from "styled-components";

export const Results = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 90%; /* Full width on mobile */
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
