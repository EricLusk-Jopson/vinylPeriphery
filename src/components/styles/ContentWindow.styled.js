import styled from "styled-components";

export const ContentWindow = styled.div`
  display: flex;
  padding-top: 100px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 100px);
  height: fit-content;
  background: ${(props) =>
    props.reverse
      ? `linear-gradient(
    180deg,
    rgba(46, 1, 1, 1) 10%,
    rgba(95, 9, 104, 1) 65%,
    rgba(2, 0, 36, 1) 90%
  );`
      : `linear-gradient(
    180deg,
    rgba(2, 0, 36, 1) 0%,
    rgba(95, 9, 104, 1) 35%,
    rgba(46, 1, 1, 1) 100%
  );`}
  border: none;
  z-index: -1;
`;
