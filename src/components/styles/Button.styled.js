import styled from "styled-components";

export const Button = styled.button`
  color: ${(props) => (props.disabled ? "rgba(25 25 25 1)" : props.color)};
  padding: 10px;
  background: rgba(50, 50, 50, 1);
  border-radius: 8px;
  transition: 0.3s;

  &:hover {
    background: ${(props) =>
      props.disabled ? "rgba(25 25 25 1)" : props.color};
    color: ${(props) => (props.disabled ? "rgba(25 25 25 1)" : "#fff")};
  }
`;
