import { useState, useEffect, React } from "react";
import { FaUser, FaRecordVinyl } from "react-icons/fa";
import {
  loadMore,
  bandReleases,
  memberReleases,
  contributorReleases,
} from "./helpers/asyncCalls";
import { ContentWindow } from "./components/styles/ContentWindow.styled";
import { ItemGroup } from "./components/styles/ItemGroup.styled";
import { Input } from "./components/Input";
import { SearchCard } from "./components/SearchCard";
import { ResultCard } from "./components/ResultCard";

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

  const toggleCollapse = (e) => {
    e.preventDefault();
    console.log();
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

  useEffect(() => {
    console.log(data);
    console.log(displayResults);
  }, [data, displayResults]);

  return (
    <>
      <ContentWindow>
        <ItemGroup>
          <Input
            icon={<FaUser />}
            text="Band"
            placeholder="Viagra Boys"
            onChange={onChange}
            name="band"
            value={band}
          ></Input>
          <Input
            icon={<FaRecordVinyl />}
            text="Album"
            placeholder="Cave World"
            onChange={onChange}
            name="album"
            value={album}
          ></Input>
        </ItemGroup>
        <ItemGroup>
          <SearchCard
            title="Band"
            text="Returns a collection of all releases associated with the band/artist. This is the fastest available search and typically yields the smallest set of results."
            color={"rgb(28, 128, 134)"}
            searchFn={getBandReleases}
          ></SearchCard>
          <SearchCard
            title="Members"
            text="Returns a collection of all releases from each of the band's members. This search may take longer for large and/or long-running groups."
            color="rgb(28, 128, 134)"
            searchFn={getMemberReleases}
          ></SearchCard>
          <SearchCard
            title="Credited"
            text="Returns all releases associated with the record's credited artists, including session musicians. This search may take over a minute to perform."
            color="rgb(28, 128, 134)"
            searchFn={getContributorReleases}
          ></SearchCard>
        </ItemGroup>
      </ContentWindow>
      {displayResults && displayResults.length > 0 && (
        <ContentWindow reverse>
          {displayResults.map((release) => (
            <>
              <ResultCard
                title={`${release.artist} - ${release.title}`}
                body={release.contributors.map((contributor) => {
                  return (
                    <p>
                      - {contributor.name}{" "}
                      {contributor.roles.lenth > 0 &&
                        `(${contributor.roles.join(", ")})`}
                    </p>
                  );
                })}
              ></ResultCard>
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
        </ContentWindow>
      )}

      <div style={{ display: "none" }}>
        <label>Exlude listings by the same artist</label>
        <input
          type="checkbox"
          checked={excludeArtist}
          onChange={toggleArtistExclusion}
        ></input>
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
