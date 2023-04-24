import React from "react";
import { ResultCard } from "./ResultCard";

const Results = ({
  data,
  displayResults,
  message,
  disableLoadMore,
  loadMore,
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
            justifyContent: "center",
            color: "white",
          }}
        >
          {message}
        </div>
        {!disableLoadMore && <button onClick={loadMore}>Load More</button>}
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
