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
  const handleButtonClick = () => {
    // Scroll down 10vh on button click
    window.scrollTo({
      top: window.pageYOffset + window.innerHeight * 0.1,
      behavior: "smooth",
    });

    // Call the original button click function (if provided)
    if (btnFnc) {
      btnFnc();
    }
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "1vw",
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <StyledContent active={active} disabled={disabled}>
        <h1 className="blocky-title bebas-neue">{title}</h1>
        <p>{body}</p>
      </StyledContent>
      <div className="progress">
        <StlyedSearchButton
          active={active}
          onClick={handleButtonClick}
          disabled={disabled}
        >
          {btnText}
        </StlyedSearchButton>
      </div>
    </div>
  );
};

export default SearchCard;
