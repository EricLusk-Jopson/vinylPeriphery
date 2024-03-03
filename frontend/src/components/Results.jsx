import React, { useState, useEffect } from "react";
import { ResultCard } from "./ResultCard";
import {
  StyledMessage,
  StyledResults,
  StyledResultsSection,
  StyledSelector,
  StyledSelectorContainer,
} from "./styles/ResultCard.styled";
import { convertStringToBoolean } from "../helpers/convertStringToBoolean";
import Tooltip from "./Tooltip";

const Results = ({
  artists,
  roles,
  numArtists,
  releasesData,
  message,
  active,
  handleSelectArtist,
  handleSelectRole,
  settings,
}) => {
  const [openCards, setOpenCards] = useState([]);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 500);
  console.log(releasesData);

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
    <StyledResultsSection>
      <StyledResults isMobileView={isMobileView}>
        <StyledMessage>{message}</StyledMessage>
        <StyledSelectorContainer border="left">
          {artists.map((artist) => (
            <Tooltip
              title={
                !convertStringToBoolean(settings.displayRoles) &&
                artist.roles.length > 0 &&
                !artist.disabled &&
                `${artist.roles.join(", ")}`
              }
              sx={{ backgroundColor: "red" }}
            >
              <StyledSelector
                key={artist.id}
                onClick={() => handleSelectArtist(artist.id)}
                disabled={artist.disabled}
                selected={artist.selected}
              >
                {artist.name}
                {convertStringToBoolean(settings.displayRoles) &&
                  artist.roles.length > 0 &&
                  artist.selected &&
                  `(${artist.roles.join(", ")})`}
              </StyledSelector>
            </Tooltip>
          ))}
        </StyledSelectorContainer>
        {roles.length > 0 && (
          <StyledSelectorContainer reverse border="right">
            {roles.map((role) => (
              <StyledSelector
                key={role.role}
                onClick={() => handleSelectRole(role.role)}
                selected={role.selected}
              >
                {role.role}
              </StyledSelector>
            ))}
          </StyledSelectorContainer>
        )}
        {releasesData.map((release, i) => (
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
            ratio={Math.round((100 * release.contributors.length) / numArtists)}
            isOpen={openCards.includes(i)}
            toggleCard={() => toggleCard(i)}
          />
        ))}
      </StyledResults>
    </StyledResultsSection>
  );
};

export default Results;
