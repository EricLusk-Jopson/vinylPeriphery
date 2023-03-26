import { useState, useEffect, React } from "react";
import { FaUser, FaRecordVinyl } from "react-icons/fa";
import {
  getSearchResult,
  getArtists,
  getMembers,
  getContributors,
  loadMore,
} from "./helpers/asyncCalls";
import {
  ContentWindow,
  SearchContainer,
} from "./components/styles/ContentWindow.styled";
import { ItemGroup } from "./components/styles/ItemGroup.styled";
import { Input } from "./components/Input";
import { SearchCard } from "./components/SearchCard";
import { ResultCard } from "./components/ResultCard";
import { Results } from "./components/styles/ResultCard.styled";
import { quickDelay, longDelay } from "./helpers/magicNumbers";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [excludeArtist, setExcludeArtist] = useState(true);
  const [excludeAlbum, setExcludeAlbum] = useState(true);
  const [settings, setSettings] = useState({ fastSearch: true });
  const [inProgress, setInProgress] = useState(false);
  const [coolDown, setCooldown] = useState(false);
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

  const bandReleases = async (band, album, fast) => {
    const delay = fast ? quickDelay : longDelay;
    const searchResponse = await getSearchResult(band, album);
    const release = await fetch(searchResponse.results[0].resource_url).then(
      (res) => res.json()
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    let callCount = 2;
    const artists = await getArtists(release, fast, callCount);
    console.log(artists);
    return artists;
  };

  const memberReleases = async (band, album, fast) => {
    const delay = fast ? quickDelay : longDelay;
    const response = await getSearchResult(band, album);
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    let callCount = 2;
    const members = await getMembers(release, fast, callCount);
    console.log(members);
    return members;
  };

  const contributorReleases = async (band, album, fast) => {
    const delay = fast ? quickDelay : longDelay;
    let callCount = 1;

    const response = await getSearchResult(band, album);

    let release;
    for (let i = 0; i < Math.min(5, response.results.length); i++) {
      const nextRelease = await fetch(response.results[i].resource_url).then(
        (res) => res.json()
      );
      callCount++;
      console.log(`Call Count: ${callCount}`);
      await new Promise((resolve) => setTimeout(resolve, delay));

      if (nextRelease.extraartists && nextRelease.extraartists.length > 0) {
        release = nextRelease;
        break;
      }
      release = nextRelease;
    }
    const contributors = await getContributors(release, fast, callCount);
    console.log(contributors);
    return contributors;
  };

  const handleSearch = async (method) => {
    if (!settings.fastSearch) {
      setInProgress(true);
    }
    let releases;
    switch (method) {
      case "band":
        releases = await bandReleases(band, album, settings.fastSearch);
        break;

      case "member":
        releases = await memberReleases(band, album, settings.fastSearch);
        break;

      case "contributor":
        releases = await contributorReleases(band, album, settings.fastSearch);
        break;

      default:
        releases = [];
        break;
    }
    setData(releases);
    setInProgress(false);
    if (settings.fastSearch) {
      setCooldown(true);
    }
  };

  const loadLast = async () => {
    const moreReleases = await loadMore(data, "prev", settings.fastSearch);
    setData(moreReleases);
  };

  const loadNext = async () => {
    const moreReleases = await loadMore(data, "next", settings.fastSearch);
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
    if (excludeAlbum) {
      filteredReleases = filteredReleases.filter(
        (release) => release.title !== album
      );
    }

    setDisplayResults(
      filteredReleases
        .sort((a, b) => b.year - a.year)
        .sort((a, b) => b.contributors.length - a.contributors.length)
    );
  }, [data, excludeArtist, band, album]);

  useEffect(() => {
    async function coolDownAfterFastSearch() {
      if (coolDown) {
        await new Promise(() => setTimeout(setCooldown(false), 60000));
      }
    }
    coolDownAfterFastSearch();
  }, [coolDown]);

  return (
    <>
      <ContentWindow>
        <SearchContainer>
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
              searchFn={() => handleSearch("band")}
              disabled={band === "" || album === ""}
            ></SearchCard>
            <SearchCard
              title="Members"
              text="Returns a collection of all releases from each of the band's members. This search may take longer for large and/or long-running groups."
              color="rgb(28, 128, 134)"
              searchFn={() => handleSearch("member")}
              disabled={band === "" || album === ""}
            ></SearchCard>
            <SearchCard
              title="Credited"
              text="Returns all releases associated with the record's credited artists, including session musicians. This search may take over a minute to perform."
              color="rgb(28, 128, 134)"
              searchFn={() => handleSearch("contributor")}
              disabled={band === "" || album === ""}
            ></SearchCard>
          </ItemGroup>
        </SearchContainer>
        <div>{`Search returned ${displayResults.length} records`}</div>
        {displayResults && displayResults.length > 0 && (
          <Results>
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
          </Results>
        )}
      </ContentWindow>

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
