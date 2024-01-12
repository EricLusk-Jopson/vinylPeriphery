import React from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  StyledResultCard,
  StyledHeader,
  StyledBody,
  Icon,
} from "./styles/ResultCard.styled";

export const ResultCard = ({
  title,
  artist,
  body,
  ratio,
  isOpen,
  toggleCard,
}) => {
  const formattedArtist = (str) => {
    let regex = /\s\(\d+\)/g;
    let newStr = str.replace(regex, "");
    return newStr;
  };

  return (
    <StyledResultCard>
      <StyledHeader onClick={toggleCard}>
        <h4>{title}</h4>
        <Icon>{isOpen ? <FaCaretUp /> : <FaCaretDown />}</Icon>
        <h4>{`${ratio}%`}</h4>
        <h5>{`By: ${formattedArtist(artist)}`}</h5>
      </StyledHeader>
      {isOpen && (
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
