import React, { useState, useEffect } from "react";
import { ResultCard } from "./ResultCard";

const Results = ({
  data,
  displayResults,
  message,
  active,
}) => {
  const [openCards, setOpenCards] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 500);

  const toggleCard = (index) => {
    setOpenCards((prevOpenCards) => {
      const isOpen = prevOpenCards.includes(index);
      return isOpen
        ? prevOpenCards.filter((i) => i !== index)
        : [...prevOpenCards, index];
    });
  };

  useEffect(() => {
    setOpenCards([]);
  }, [active]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 500);
    };

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          width: isMobileView ? "95vw" : "70%", // Adjusted width based on isMobileView
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
            color: "#ccc",
          }}
        >
          {message}
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
            ratio={Math.round(
              (100 * release.contributors.length) / data.length
            )}
            isOpen={openCards.includes(i)}
            toggleCard={() => toggleCard(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default Results;
