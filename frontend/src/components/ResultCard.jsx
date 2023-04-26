import { useState, React } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  StyledResultCard,
  StyledHeader,
  StyledBody,
  Icon,
} from "./styles/ResultCard.styled";

export const ResultCard = ({ title, artist, body, ratio }) => {
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
        <h4>{`${ratio}%`}</h4>
        <h5>{`By: ${artist}`}</h5>
      </StyledHeader>
      {open && (
        <StyledBody>
          <p>Featuring: </p>
          {body.map((text, i) => (
            <p key={`featured-${i}`}>{text}</p>
          ))}
        </StyledBody>
      )}
    </StyledResultCard>
  );
};
