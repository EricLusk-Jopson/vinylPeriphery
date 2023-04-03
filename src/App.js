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
import { ResultCard } from "./components/ResultCard";
import { quickDelay, longDelay } from "./helpers/magicNumbers";
import { Button } from "./components/styles/Button.styled";

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
  const [loadingInfo, setLoadingInfo] = useState({
    artists: { isLoading: false, loadingTime: 1 },
    members: { isLoading: false, loadingTime: 1 },
    credits: { isLoading: false, loadingTime: 1 },
    records: { isLoading: false, loadingTime: 1 },
  });
  const [loadingArtist, setLoadingArtist] = useState(false);
  const [loadTimeArtist, setLoadTimeArtist] = useState(1);
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
    const temp = {
      ...loadingInfo,
      artists: { isLoading: !loadingInfo.artists.isLoading, loadingTime: 3 },
    };
    console.log(temp);
    setLoadingInfo(temp);
  };

  const handleSettingsChange = (e) => {
    e.preventDefault();
    setSettings({ ...settings, [e.target.name]: e.target.value });
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

  useEffect(() => {
    console.log(band, album);
  }, [band, album]);

  return (
    <>
      <div
        className="app"
        style={{
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        <div
          className="red-angle"
          style={{ position: "absolute", top: 0, left: 0 }}
        ></div>
        <div
          className="upper-search"
          style={{
            position: "relative",
            height: "50vh",
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
                top: "0",
                left: "7%",
                backgroundColor: "black",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                color: "white",
                fontWeight: "bold",
                transform: `${
                  loadingInfo.artists.isLoading
                    ? "translate(0, 0)"
                    : "translate(0%, -96%)"
                }`,
                transition: `transform ${
                  loadingInfo.artists.isLoading
                    ? loadingInfo.artists.loadingTime
                    : 1
                }s linear`,
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
                transform: `${
                  loadingInfo.members.isLoading
                    ? "translate(0, 0)"
                    : "translate(0%, -96%)"
                }`,
                transition: `transform ${
                  loadingInfo.members.isLoading
                    ? loadingInfo.members.loadingTime
                    : 1
                }s linear`,
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
                transform: `${
                  loadingInfo.credits.isLoading
                    ? "translate(0, 0)"
                    : "translate(0%, -96%)"
                }`,
                transition: `transform ${
                  loadingInfo.credits.isLoading
                    ? loadingInfo.credits.loadingTime
                    : 1
                }s linear`,
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
                transform: `${
                  loadingInfo.records.isLoading
                    ? "translate(0, 0)"
                    : "translate(0%, -96%)"
                }`,
                transition: `transform ${
                  loadingInfo.records.isLoading
                    ? loadingInfo.records.loadingTime
                    : 1
                }s linear`,
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
              marginBottom: "60px",
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
                zIndex: 2,
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
                zIndex: 2,
              }}
            ></input>
          </div>
          <div
            className="settings"
            style={{
              position: "fixed",
              width: "20vw",
              height: "60vw",
              backgroundColor: "red",
              top: "-30vw",
              left: "65%",
              transformOrigin: "100% 50%",
              rotate: displaySettings ? "0deg" : "83deg",
              zIndex: "10",
              transition: "rotate 0.35s ease",
            }}
          >
            <div
              className="settings-block"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                position: "absolute",
                left: 0,
                top: "50%",
                width: "80%",
                height: "30%",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  justifyContent: "space-between",
                }}
              >
                <label>Search Type</label>
                <select
                  name="searchType"
                  value={settings.searchType}
                  onChange={handleSettingsChange}
                >
                  <option value="fast">Fast</option>
                  <option value="comprehensive">Comprehensive</option>
                </select>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  justifyContent: "space-between",
                }}
              >
                <label>Exclude Searched Artist</label>
                <select
                  name="excludeArtist"
                  value={settings.excludeArtist}
                  onChange={handleSettingsChange}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  justifyContent: "space-between",
                }}
              >
                <label>Exclude Searched Album</label>
                <select
                  name="excludeAlbum"
                  value={settings.excludeAlbum}
                  onChange={handleSettingsChange}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  justifyContent: "space-between",
                }}
              >
                <label>Exclude Various</label>
                <select
                  name="excludeVarious"
                  value={settings.excludeVarious}
                  onChange={handleSettingsChange}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>
            </div>
            <div
              className="button-block"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                padding: 0,
                zIndex: "11",
              }}
            >
              <button
                onClick={toggleSettingsModal}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  padding: 0,
                  fontSize: "3vw",
                  background: "none",
                  border: "none",
                  color: "white",
                  margin: 0,
                  transformOrigin: "0% 100%",
                  rotate: "-90deg",
                }}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
        <div
          className="lower-search"
          style={{
            height: "40vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            backgroundColor: "black",
            color: "white",
            paddingTop: "30px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ width: "25%" }}>
            <div className="title">
              <h1>Artist</h1>
            </div>
            <div className="body">
              Returns a collection of all releases associated with the
              band/artist. This is the fastest available search and typically
              yields the smallest set of results.
            </div>
            <div className="progress" style={{ margin: "1em 0" }}>
              <button onClick={() => handleSearch("band")}>Search</button>
            </div>
          </div>
          <div style={{ width: "25%" }}>
            <div className="title">
              <h1>Members</h1>
            </div>
            <div className="body">
              Returns a collection of all releases from each of the band's
              members. This search may take longer for large and/or long-running
              groups.
            </div>
            <div className="progress" style={{ margin: "1em 0" }}>
              <button onClick={() => handleSearch("member")}>Search</button>
            </div>
          </div>
          <div style={{ width: "25%" }}>
            <div className="title">
              <h1>Contributors</h1>
            </div>
            <div className="body">
              Returns all releases associated with the record's credited
              artists, including session musicians. This search may take over a
              minute to perform.
            </div>
            <div className="progress" style={{ margin: "1em 0" }}>
              <button onClick={() => handleSearch("contributor")}>
                Search
              </button>
            </div>
          </div>
        </div>
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
          {displayResults && displayResults.length > 0 && (
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
                <div
                  style={{ color: "#fff" }}
                >{`Search returned ${displayResults.length} records`}</div>
                <Button
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
                </Button>
              </div>
              {displayResults.map((release, i) => (
                <ResultCard
                  key={`resultCard-${i}`}
                  title={release.title}
                  artist={release.artist}
                  body={release.contributors.map(
                    (contributor) =>
                      contributor.name +
                      (contributor.roles.length > 0 &&
                      contributor.roles[0] !== ""
                        ? ` (${contributor.roles.join(", ")})`
                        : "")
                  )}
                ></ResultCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* <ContentWindow>
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
      </ContentWindow> */}
    </>
  );
}

export default App;
