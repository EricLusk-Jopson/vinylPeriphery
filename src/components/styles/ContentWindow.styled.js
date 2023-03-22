import styled from "styled-components";

export const ContentWindow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(
    120deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(95, 9, 104, 1) 35%,
    rgba(255, 29, 0, 1) 100%
  );
  border: none;
  z-index: -1;
`;
