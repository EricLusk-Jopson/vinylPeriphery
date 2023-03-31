import React from "react";
import { StyledSearchCard, BorderCard } from "./styles/SearchCard.styled";

export const SearchCard = ({
  title,
  text,
  color,
  searchFn,
  disabled,
  coolDown,
}) => {
  return (
    <BorderCard color={color}>
      <StyledSearchCard color={color} disabled={disabled} coolDown={coolDown}>
        <div className="title">
          <h1>{title}</h1>
        </div>
        <div className="body">
          {text.split(". ").map((sentence, i) => {
            return <p key={`body-${i}`}>{sentence}</p>;
          })}
        </div>

        <div className="progress"></div>
        <button onClick={searchFn} disabled={disabled}>
          Search
        </button>
      </StyledSearchCard>
    </BorderCard>
  );
};
