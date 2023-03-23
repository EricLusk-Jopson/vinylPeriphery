import { useState, React } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

import {
  StyledResultCard,
  StyledHeader,
  StyledBody,
  H1,
  Icon,
} from "./styles/ResultCard.styled";

export const ResultCard = ({ title, body }) => {
  const [open, setOpen] = useState(false);

  const toggleCollapse = (e) => {
    e.preventDefault();
    const op = open;
    setOpen(!op);
  };
  return (
    <StyledResultCard>
      <StyledHeader onClick={toggleCollapse}>
        <H1>{title}</H1>
        <Icon>{open ? <FaCaretUp /> : <FaCaretDown />}</Icon>
      </StyledHeader>
      {open && <StyledBody>{body}</StyledBody>}
    </StyledResultCard>
  );
};
