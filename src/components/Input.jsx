import React from "react";
import {
  InputGroup,
  StyledInput,
  StyledLabel,
} from "./styles/InputGroup.styled";

export const Input = ({ icon, text, ...props }) => {
  return (
    <InputGroup>
      <StyledInput
        placeholder={props.placeholder}
        onChange={props.onChange}
        type="text"
        name={props.name}
        value={props.value}
      ></StyledInput>
      <StyledLabel>
        {icon}
        <span>{text}</span>
      </StyledLabel>
    </InputGroup>
  );
};
