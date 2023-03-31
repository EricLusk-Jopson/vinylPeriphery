import { useState, useEffect, React } from "react";
import { FaUser, FaRecordVinyl, FaCog } from "react-icons/fa";
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
import { Button } from "./components/styles/Button.styled";
import SettingsModal from "./components/SettingsModal";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [settings, setSettings] = useState({
    searchType: "fast",
    excludeArtist: "true",
    excludeAlbum: "true",
    excludeVarious: "false",
    searchSpeeds: {
      fast: 0,
      comprehensive: 3200,
    },
  });
  const [message, setMessage] = useState("");
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

  const convertStringToBoolean = (str) => {
    if (str === "true") return true;
    else return false;
  };

  const bandReleases = async (response, fast) => {
    setMessage("Retrieving album info...");
    const delay = fast ? quickDelay : longDelay;
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    let callCount = 2;
    setMessage(
      `Checking releases associated with ${
        release.artists.length
      } artist. This will take up to ${
        (release.artists.length * settings.searchSpeeds[settings.searchType]) /
          1000 +
        1
      } seconds.`
    );
    const artists = await getArtists(release, fast, callCount);
    return artists;
  };

  const memberReleases = async (response, fast) => {
    const delay = fast ? quickDelay : longDelay;
    const release = await fetch(response.results[0].resource_url).then((res) =>
      res.json()
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
    let callCount = 2;
    setMessage(
      `Checking releases associated with ${
        release.artists.length
      } artist. This may take up to ${
        (release.artists.length *
          10 *
          settings.searchSpeeds[settings.searchType]) /
          1000 +
        1
      } seconds.`
    );
    const members = await getMembers(release, fast, callCount);
    console.log(members);
    return members;
  };

  const contributorReleases = async (response, fast) => {
    const delay = fast ? quickDelay : longDelay;
    let callCount = 1;
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
    setMessage(
      `Checking releases associated with ${
        release.extraartists.length
      } artist. This may take up to ${
        (release.extraartists.length *
          settings.searchSpeeds[settings.searchType]) /
          1000 +
        1
      } seconds.`
    );
    const contributors = await getContributors(release, fast, callCount);
    console.log(contributors);
    return contributors;
  };

  const handleSearch = async (method) => {
    const fastSearch = settings.searchType === "fast";
    setInProgress(true);
    setMessage("Searching for album...");
    const response = await getSearchResult(band, album);
    setMessage("Album located");
    let releases;
    switch (method) {
      case "band":
        releases = await bandReleases(response, fastSearch);
        break;

      case "member":
        releases = await memberReleases(response, fastSearch);
        break;

      case "contributor":
        releases = await contributorReleases(response, fastSearch);
        break;

      default:
        releases = [];
        break;
    }
    setData(releases);
    setInProgress(false);
    console.log(settings, coolDown);
    if (settings.searchType === "fast") {
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

  const toggleSettingsModal = () => {
    const isOpen = displaySettings;
    setDisplaySettings(!isOpen);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
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
    if (convertStringToBoolean(settings.excludeArtist)) {
      filteredReleases = filteredReleases.filter(
        (release) => release.artist.toLowerCase() !== band.toLowerCase()
      );
    }
    if (convertStringToBoolean(settings.excludeAlbum)) {
      filteredReleases = filteredReleases.filter(
        (release) => release.title.toLowerCase() !== album.toLowerCase()
      );
    }
    if (convertStringToBoolean(settings.excludeVarious)) {
      filteredReleases = filteredReleases.filter(
        (release) => release.artist.toLowerCase() !== "various"
      );
    }

    setDisplayResults(
      filteredReleases
        .sort((a, b) => b.year - a.year)
        .sort((a, b) => b.contributors.length - a.contributors.length)
    );
  }, [data, band, album, settings]);

  useEffect(() => {
    console.log("coolDown effect called. Cooldown is ", coolDown);
    async function coolDownAfterFastSearch() {
      if (coolDown) {
        await new Promise(() => setTimeout(() => setCooldown(false), 60000));
      }
    }
    coolDownAfterFastSearch();
  }, [coolDown]);

  return (
    <>
      <div className="app" style={{ display: "flex", flexDirection: "column" }}>
        <div
          className="upper-search"
          style={{
            minHeight: "40vh",
            height: "40vh",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div
            className="progress-block"
            style={{ position: "relative", width: "40vw" }}
          >
            <div
              className="progress-bar"
              style={{
                width: "18%",
                position: "absolute",
                top: 0,
                left: "7%",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <p>A</p> <p>R</p> <p>T</p> <p>I</p> <p>S</p> <p>T</p> <p>S</p>
            </div>
            <div
              className="progress-bar"
              style={{
                width: "18%",
                position: "absolute",
                top: 0,
                left: "31%",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <p>M</p> <p>E</p> <p>M</p> <p>B</p> <p>E</p> <p>R</p> <p>S</p>
            </div>
            <div
              className="progress-bar"
              style={{
                width: "18%",
                position: "absolute",
                top: 0,
                left: "55%",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <p>C</p> <p>R</p> <p>E</p> <p>D</p> <p>I</p> <p>T</p> <p>S</p>
            </div>
            <div
              className="progress-bar"
              style={{
                width: "18%",
                position: "absolute",
                top: 0,
                left: "79%",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <p>R</p> <p>E</p> <p>C</p> <p>O</p> <p>R</p> <p>D</p> <p>S</p>
            </div>
          </div>
          <div
            className="input-block"
            style={{
              width: "60vw",
              display: "flex",
              flexDirection: "column-reverse",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <input
              placeholder="Band"
              onChange={onChange}
              name="band"
              value={band}
              style={{
                border: "none",
                borderBottom: "4px solid black",
                width: "60%",
                marginTop: "50px",
                outline: "none",
                fontSize: "1.6em",
              }}
            ></input>
            <input
              placeholder="Album"
              onChange={onChange}
              name="album"
              value={album}
              style={{
                border: "none",
                borderBottom: "4px solid black",
                width: "60%",
                marginTop: "50px",
                outline: "none",
                fontSize: "1.6em",
              }}
            ></input>
          </div>
        </div>
        <div
          className="lower-search"
          style={{ height: "60vh", display: "flex", flexDirection: "row" }}
        >
          <div>
            <div className="title">
              <h1>Artist</h1>
            </div>
            <div className="body">Body Text</div>
            <div className="progress"></div>
            <button>Search</button>
          </div>
          <div>
            <div className="title">
              <h1>Members</h1>
            </div>
            <div className="body">Body Text</div>
            <div className="progress"></div>
            <button>Search</button>
          </div>
          <div>
            <div className="title">
              <h1>Contributors</h1>
            </div>
            <div className="body">Body Text</div>
            <div className="progress"></div>
            <button>Search</button>
          </div>
        </div>
        <div className="results"></div>
      </div>
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
              coolDown={coolDown}
            ></SearchCard>
            <SearchCard
              title="Members"
              text="Returns a collection of all releases from each of the band's members. This search may take longer for large and/or long-running groups."
              color="rgb(28, 128, 134)"
              searchFn={() => handleSearch("member")}
              disabled={band === "" || album === ""}
              coolDown={coolDown}
            ></SearchCard>
            <SearchCard
              title="Credited"
              text="Returns all releases associated with the record's credited artists, including session musicians. This search may take over a minute to perform."
              color="rgb(28, 128, 134)"
              searchFn={() => handleSearch("contributor")}
              disabled={band === "" || album === ""}
              coolDown={coolDown}
            ></SearchCard>
          </ItemGroup>
        </SearchContainer>
        {displayResults && displayResults.length > 0 && (
          <Results>
            <ItemGroup>
              <Button
                color="rgb(28, 128, 134)"
                disabled={data.every(
                  (artist) => artist.pagination.prev === undefined
                )}
                onClick={loadLast}
              >
                Load Last Page
              </Button>
              <div
                style={{ color: "#fff" }}
              >{`Search returned ${displayResults.length} records`}</div>
              <Button
                color="rgb(28, 128, 134)"
                disabled={data.every(
                  (artist) => artist.pagination.next === undefined
                )}
                onClick={loadNext}
              >
                Load Next Page
              </Button>
            </ItemGroup>
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
        <button
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: 0,
            height: "1.1em",
            width: "1.1em",
            fontSize: "2em",
            background: "none",
            border: "none",
          }}
        >
          <FaCog onClick={toggleSettingsModal} style={{ color: "white" }} />
        </button>
      </ContentWindow>
      {displaySettings && (
        <SettingsModal
          applySettings={handleSettingsChange}
          cancelModal={toggleSettingsModal}
          settings={settings}
        />
      )}
    </>
  );
}

export default App;
