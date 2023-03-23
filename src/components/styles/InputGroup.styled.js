import styled from "styled-components";

export const InputGroup = styled.div`
  position: relative;
`;

export const StyledInput = styled.input`
  border: none;
  border-radius: 20px;
  flex-grow: 1;
  margin: 10px;
  padding: 10px 100px;
  background: rgba(2, 0, 36, 0.6);
  color: rgba(88, 199, 250, 1);

  display: inline-block;
  min-width: 300px;
  width: 30vw;
  max-width: 500px;
  height: 3.5rem;
  box-sizing: border-box;
  border-radius: 20px;
  transition: all 0.4s ease-out;
  transition-delay: 0s;

  &:focus + label {
    transform: translateY(-65px) translateX(0%);
    transition: all 0.4s ease-in;
    outline: none;
  }

  &:focus {
    padding: 10px;
    transition: all 0.4s ease-out;
    transition-delay: 0.4s;
  }
`;

export const StyledLabel = styled.label`
  position: absolute;
  top: 10px;
  left: 10px;
  bottom: 0;
  height: 3.5rem;
  width: 70px;

  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  line-height: 40px;
  color: rgb(88, 199, 250, 1);
  border-radius: 20px;
  padding: 0 10px;
  background: rgba(2, 0, 36, 0.5);
  border: 2px solid rgba(88, 199, 250, 1);
  transform: translateZ(0) translateX(0);
  transition: all 0.3s ease-in;
  transition-delay: 0.2s;
`;
