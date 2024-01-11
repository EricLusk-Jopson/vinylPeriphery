import React from "react";
import { StlyedSearchButton, StyledContent } from "./styles/SearchCard.styled";

const SearchCard = ({
  title,
  body,
  active,
  disabled,
  btnFnc,
  btnText = "Search",
}) => {
  console.log(active, disabled);
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "4vw",
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <StyledContent active={active} disabled={disabled}>
        <h1>{title}</h1>
        <p>{body}</p>
      </StyledContent>
      <div className="progress">
        <StlyedSearchButton
          active={active}
          onClick={btnFnc}
          disabled={disabled}
        >
          {btnText}
        </StlyedSearchButton>
      </div>
    </div>
  );
};

export default SearchCard;
