import { useState, React } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";

import {
  StyledResultCard,
  StyledHeader,
  StyledBody,
  H1,
  Icon,
} from "./styles/ResultCard.styled";

export const ResultCard = ({ title, artist, body }) => {
  const [open, setOpen] = useState(false);

  const toggleCollapse = (e) => {
    e.preventDefault();
    const op = open;
    setOpen(!op);
  };
  return (
    <StyledResultCard>
      <StyledHeader onClick={toggleCollapse}>
        <h4>{title}</h4>
        <Icon>{open ? <FaCaretUp /> : <FaCaretDown />}</Icon>
        <h5>{`By: ${artist}`}</h5>
      </StyledHeader>
      {open && (
        <StyledBody>
          <p>Featuring: </p>
          {body.map((text) => (
            <p>{text}</p>
          ))}
        </StyledBody>
      )}
    </StyledResultCard>
  );
};