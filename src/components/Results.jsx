import React from "react";
import { ResultCard } from "./ResultCard";

const Results = ({ data, displayResults, message, loadLast, loadNext }) => {
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
          <button
            disabled={data.every(
              (artist) => artist.pagination.prev === undefined
            )}
            onClick={loadLast}
            style={{
              border: "none",
              backgroundColor: "unset",
              color: "white",
              fontSize: "1em",
              padding: 0,
              margin: "0px 20px",
            }}
          >
            Last
          </button>
          <div style={{ color: "#fff" }}>{message}</div>
          <button
            disabled={data.every(
              (artist) => artist.pagination.next === undefined
            )}
            onClick={loadNext}
            style={{
              border: "none",
              backgroundColor: "unset",
              color: "white",
              fontSize: "1em",
              padding: 0,
              margin: "0px 20px",
            }}
          >
            Next
          </button>
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
