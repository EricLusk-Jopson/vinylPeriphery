import { useState, React, useEffect } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import {
  StyledResultCard,
  StyledHeader,
  StyledBody,
  Icon,
} from "./styles/ResultCard.styled";

export const ResultCard = ({ title, artist, body, ratio, loadCoverArt }) => {
  const [open, setOpen] = useState(false);
  const [albumArt, setAlbumArt] = useState(null);

  const toggleCollapse = (e) => {
    e.preventDefault();
    const op = open;
    setOpen(!op);
  };

  const formattedArtist = (str) => {
    let regex = /\s\(\d+\)/g;
    let newStr = str.replace(regex, "");
    return newStr;
  };

  useEffect(() => {
    async function fetchdata(title, artist) {
      const art = await loadCoverArt(title, artist);
      console.log(art);
      setAlbumArt(art);
    }

    if (open && !albumArt) {
      fetchdata(title, artist);
    }
  }, [open]);

  return (
    <StyledResultCard>
      <StyledHeader onClick={toggleCollapse}>
        <h4>{title}</h4>
        <Icon>{open ? <FaCaretUp /> : <FaCaretDown />}</Icon>
        <h4>{`${ratio}%`}</h4>
        <h5>{`By: ${formattedArtist(artist)}`}</h5>
      </StyledHeader>
      {open && (
        // TODO amend styled body to space on row and include future content links.
        <StyledBody>
          <img src={albumArt} alt="album cover art" />
          <p>Featuring: </p>
          {body.map((text, i) => (
            <p key={`featured-${i}`}>{text}</p>
          ))}
        </StyledBody>
      )}
    </StyledResultCard>
  );
};
