import styled from "styled-components";

export const Results = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 70%;
`;

export const StyledResultCard = styled.div`
  width: 100%;
  margin: 10px 0px;
  color: white;
  border-bottom: 1px solid white;
`;

export const StyledHeader = styled.div`
  display: grid;
  grid-template-columns: 90% 10%;
  grid-template-rows: 2rem 1.6rem;
  align-items: center;
  padding: 0px 20px;
`;

export const H1 = styled.h1`
  display: inline;
  overflow: hidden;
  max-width: 80%;
`;

export const Icon = styled.span`
  font-size: 1.5rem;
`;

export const StyledBody = styled.div`
  padding: 0px 20px;
  height: fit-content;
`;
