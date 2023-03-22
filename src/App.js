import { useState, useEffect, React } from "react";
import {
  loadMore,
  bandReleases,
  memberReleases,
  contributorReleases,
} from "./helpers/asyncCalls";
import { ContentWindow } from "./components/styles/ContentWindow.styled";
import { ItemGroup, StyledInput } from "./components/styles/InputGroup.styled";
import { SearchCard } from "./components/SearchCard";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [excludeArtist, setExcludeArtist] = useState(true);
  const [formData, setFormData] = useState({
    band: "",
    album: "",
  });
  const { band, album } = formData;

  const consumer_key = "owJjvljKmrcdSbXFVPTu";
  const consumer_secret = "wgJurrmQFbROAyrmByuLrZMRMhDznPaK";
  const search_url = "https://api.discogs.com/database/search?";

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleArtistExclusion = (e) => {
    e.preventDefault();
    setExcludeArtist(!excludeArtist);
  };

  const getBandReleases = async () => {
    const releases = await bandReleases(band, album);
    setData(releases);
  };

  const getMemberReleases = async () => {
    const releases = await memberReleases(band, album);
    setData(releases);
  };

  const getContributorReleases = async () => {
    const releases = await contributorReleases(band, album);
    setData(releases);
  };

  const loadLast = async () => {
    const moreReleases = await loadMore(data, "prev");
    setData(moreReleases);
  };

  const loadNext = async () => {
    const moreReleases = await loadMore(data, "next");
    setData(moreReleases);
  };

  useEffect(() => {
    const displayReleases = new Map();
    data.forEach((artist) => {
      artist.releases.forEach((release) => {
        const id = release.main_release ? release.main_release : release.id;
        const contributors = [];
        if (displayReleases.has(id)) {
          contributors.push(...displayReleases.get(id).contributors);
        }
        if (
          !contributors.some((contributor) => contributor.name === artist.name)
        ) {
          contributors.push({ name: artist.name, roles: artist.roles });
        }
        displayReleases.set(id, {
          artist: release.artist,
          title: release.title,
          year: release.year,
          contributors: contributors,
        });
      });
    });
    let filteredReleases = [...displayReleases.values()];
    if (excludeArtist) {
      filteredReleases = filteredReleases.filter(
        (release) => release.artist !== band
      );
    }
    setDisplayResults(
      filteredReleases
        .sort((a, b) => b.year - a.year)
        .sort((a, b) => b.contributors.length - a.contributors.length)
    );
  }, [data, excludeArtist]);

  return (
    <>
      <ContentWindow>
        <ItemGroup>
          <StyledInput
            type="text"
            name="band"
            value={band}
            placeholder="band name"
            onChange={onChange}
          />
          <StyledInput
            type="text"
            name="album"
            value={album}
            placeholder="album name"
            onChange={onChange}
          />
        </ItemGroup>
        <ItemGroup>
          <SearchCard
            title="Band"
            text="Returns a collection of all known releases associated with the band/artist. This is the fastest available search and typically yields the smallest set of results."
            color={"#1c7c86"}
          ></SearchCard>
          <SearchCard
            title="Members"
            text="Returns a collection of all known releases associated with the band/artist. This is the fastest available search and typically yields the smallest set of results."
            color="rgb(28, 128, 134)"
          ></SearchCard>
          <SearchCard
            title="Credited"
            text="Returns a collection of all known releases associated with the band/artist. This is the fastest available search and typically yields the smallest set of results."
            color="rgb(28, 128, 134)"
          ></SearchCard>
        </ItemGroup>
      </ContentWindow>
      <div style={{ display: "none" }}>
        <form>
          <input
            type="text"
            name="band"
            value={band}
            placeholder="band name"
            onChange={onChange}
          />
          <input
            type="text"
            name="album"
            value={album}
            placeholder="album name"
            onChange={onChange}
          />
        </form>
        <label>Exlude listings by the same artist</label>
        <input
          type="checkbox"
          checked={excludeArtist}
          onChange={toggleArtistExclusion}
        ></input>
        <button onClick={getBandReleases}>artist</button>
        <button onClick={getMemberReleases}>members</button>
        <button onClick={getContributorReleases}>contributors</button>
        <div>
          {displayResults &&
            displayResults.length > 0 &&
            displayResults.map((release) => (
              <>
                <h3>
                  {release.artist} - {release.title}, {release.year}.
                </h3>
                {release.contributors.map((contributor) => {
                  return (
                    <p>
                      - {contributor.name}{" "}
                      {contributor.roles.lenth > 0 &&
                        `(${contributor.roles.join(", ")})`}
                    </p>
                  );
                })}
              </>
            ))}
        </div>
        <button
          disabled={data.every(
            (artist) => artist.pagination.prev === undefined
          )}
          onClick={loadLast}
        >
          Load Last Page
        </button>
        <button
          disabled={data.every(
            (artist) => artist.pagination.next === undefined
          )}
          onClick={loadNext}
        >
          Load Next Page
        </button>
      </div>
    </>
  );
}

export default App;
