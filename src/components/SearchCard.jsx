import React from "react";
import { StyledSearchCard, BorderCard } from "./styles/SearchCard.styled";

export const SearchCard = ({ title, text, color }) => {
  return (
    <BorderCard color={color}>
      <StyledSearchCard color={color}>
        <h1>{title}</h1>
        {text.split(". ").map((sentence) => {
          return <p>{sentence}</p>;
        })}
        <button>Search</button>
      </StyledSearchCard>
    </BorderCard>
  );
};
