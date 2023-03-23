import React from "react";
import { StyledSearchCard, BorderCard } from "./styles/SearchCard.styled";

export const SearchCard = ({ title, text, color, searchFn }) => {
  return (
    <BorderCard color={color}>
      <StyledSearchCard color={color}>
        <div className="title">
          <h1>{title}</h1>
        </div>
        <div className="body">
          {text.split(". ").map((sentence) => {
            return <p>{sentence}</p>;
          })}
        </div>

        <button onClick={searchFn}>Search</button>
      </StyledSearchCard>
    </BorderCard>
  );
};
