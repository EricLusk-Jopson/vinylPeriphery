import React from "react";
import { ResultCard } from "./ResultCard";
import { StyledLoadButton } from "./styles/ResultCard.styled";

const Results = ({
  data,
  displayResults,
  message,
  loadLast,
  loadNext,
  currentPage,
  coolDown,
}) => {
  return (
    <div
      className="results"
      style={{
        minHeight: "10vh",
        backgroundColor: "black",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "70%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "10vh",
            fontSize: "1em",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <StyledLoadButton
            disabled={currentPage === 1 || coolDown}
            onClick={loadLast}
          >
            Last
          </StyledLoadButton>
          <div style={{ color: "#fff" }}>{message}</div>
          <StyledLoadButton
            disabled={
              data.every((artist) => artist.pages <= currentPage) || coolDown
            }
            onClick={loadNext}
          >
            Next
          </StyledLoadButton>
        </div>
        {displayResults.map((release, i) => (
          <ResultCard
            key={`resultCard-${i}`}
            title={release.title}
            artist={release.artist}
            body={release.contributors.map(
              (contributor) =>
                contributor.name +
                (contributor.roles.length > 0 && contributor.roles[0] !== ""
                  ? ` (${contributor.roles.join(", ")})`
                  : "")
            )}
          ></ResultCard>
        ))}
      </div>
    </div>
  );
};

export default Results;
