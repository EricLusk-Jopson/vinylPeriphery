import { useState, useEffect, React } from "react";
import {
  getSearchResult,
  createArtistRecord,
  getContributors,
  loadMore,
  fetchAndWait,
} from "./helpers/asyncCalls";
import { ResultCard } from "./components/ResultCard";
import { callLimit, quickDelay, longDelay } from "./helpers/magicNumbers";
import LoadingBar from "./components/LoadingBar";
import { StyledLoadingBarWrapper } from "./components/styles/LoadingBar.styled";
import { StyledInput } from "./components/styles/Input";

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
      fast: 100,
      comprehensive: 3200,
    },
    coolDownRate: {
      fast: 55,
      comprehensive: 3.2,
    },
  });
  const [loadingStates, setLoadingStates] = useState({
    connect: { isLoading: false, isComplete: false },
    artists: { isLoading: false, isComplete: false },
    members: { isLoading: false, isComplete: false },
    credits: { isLoading: false, isComplete: false },
    records: { isLoading: false, isComplete: false },
  });
  const [message, setMessage] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [coolDown, setCooldown] = useState(false);
  const [formData, setFormData] = useState({
    band: "",
    album: "",
  });
  const { band, album } = formData;
  const [progress, setProgress] = useState(0);

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

  const bandReleases = async () => {
    // Set temp and message
    let temp = {
      connect: { isLoading: true, isComplete: false },
      artists: { isLoading: false, isComplete: false },
      members: { isLoading: false, isComplete: false },
      credits: { isLoading: false, isComplete: false },
      records: { isLoading: false, isComplete: false },
    };
    setLoadingStates(temp);
    setMessage("Searching for album...");

    // try to get searchResult
    try {
      const response = await getSearchResult(band, album);
      await new Promise((resolve) =>
        setTimeout(resolve, settings.searchSpeeds[settings.searchType])
      );

      setMessage("Album located");
      setMessage("Retrieving album info...");

      const release = await fetchAndWait(
        response.results[0].resource_url,
        settings.searchSpeeds[settings.searchType]
      );
      console.log(release);

      let temp = {
        ...loadingStates,
        connect: { isLoading: false, isComplete: true },
        artists: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);

      let callCount = 2;
      setMessage(
        `Checking releases associated with ${
          release.artists.length
        } artist. This will take up to ${
          (release.artists.length *
            settings.searchSpeeds[settings.searchType]) /
            1000 +
          1
        } seconds.`
      );
      let currentCount = callCount;

      const output = [];
      temp = {
        ...temp,
        records: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);

      // for every artist recorded in the response
      for (const artist of release.artists) {
        if (settings.searchType === "fast" && currentCount >= callLimit - 2)
          break;
        console.log(`searching for artist ${artist.name}...`);

        try {
          // fetch their information
          const artistResponse = await fetchAndWait(
            artist.resource_url,
            settings.searchSpeeds[settings.searchType]
          );
          currentCount++;

          // fetch their releases
          const releasesResponse = await fetchAndWait(
            `https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100`,
            settings.searchSpeeds[settings.searchType]
          );
          currentCount++;

          if (
            releasesResponse &&
            releasesResponse.releases &&
            releasesResponse.pagination
          ) {
            const newArtist = createArtistRecord(
              artist.name,
              artist.id,
              {
                prev: releasesResponse.pagination.urls?.prev,
                next: releasesResponse.pagination.urls?.next,
                last: releasesResponse.pagination.urls?.last,
              },
              releasesResponse.releases,
              artist.roles ?? [""]
            );
            output.push(newArtist);
          }
          temp = {
            ...temp,
            artists: { isLoading: false, isComplete: true },
            records: { isLoading: false, isComplete: true },
          };
          console.log(temp);
          setLoadingStates(temp);
          console.log(output);
        } catch (error) {
          console.error(`Error: ${error}`);
          temp = {
            ...temp,
            artists: { isLoading: false, isComplete: false },
            records: { isLoading: false, isComplete: false },
          };
          console.log(temp);
          setLoadingStates(temp);
        }
      }
      setData(output);
    } catch (error) {
      temp = {
        ...temp,
        connect: { isLoading: false, isComplete: false },
      };
      setLoadingStates(temp);
      console.log(error);
    }
  };

  const memberReleases = async () => {
    let temp = {
      connect: { isLoading: true, isComplete: false },
      artists: { isLoading: false, isComplete: false },
      members: { isLoading: false, isComplete: false },
      credits: { isLoading: false, isComplete: false },
      records: { isLoading: false, isComplete: false },
    };
    setLoadingStates(temp);
    setMessage("Searching for album...");
    try {
      const response = await getSearchResult(band, album);
      await new Promise((resolve) =>
        setTimeout(resolve, settings.searchSpeeds[settings.searchType])
      );
      setMessage("Album located");
      setMessage("Retrieving album info...");
      const release = await fetchAndWait(
        response.results[0].resource_url,
        settings.searchSpeeds[settings.searchType]
      );
      temp = {
        ...temp,
        connect: { isLoading: false, isComplete: true },
        members: { isLoading: true, isComplete: false },
        records: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);
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
      let currentCount = callCount;
      const output = [];

      // for every artist recorded in the response
      for (const artist of release.artists) {
        if (settings.searchType === "fast" && currentCount >= callLimit) break;
        console.log(`searching for artist ${artist.name}...`);

        try {
          // fetch their information and count++
          const artistResponse = await fetchAndWait(
            artist.resource_url,
            settings.searchSpeeds[settings.searchType]
          );
          currentCount++;

          // determine if they have members
          if (artistResponse.hasOwnProperty("members")) {
            // for each member in the band
            for (const member of artistResponse.members) {
              if (
                settings.searchType === "fast" &&
                currentCount >= callLimit - 2
              )
                break;

              try {
                // fetch their information and count++
                const memberResponse = await fetchAndWait(
                  member.resource_url,
                  settings.searchSpeeds[settings.searchType]
                );
                currentCount++;

                // fetch their releases and count++
                const memberReleasesResponse = await fetchAndWait(
                  `https://api.discogs.com/artists/${memberResponse.id}/releases?page=1&per_page=100`,
                  settings.searchSpeeds[settings.searchType]
                );
                currentCount++;

                // Check that the member release response is properly formatted
                if (
                  memberReleasesResponse &&
                  memberReleasesResponse.releases &&
                  memberReleasesResponse.pagination
                ) {
                  // Create a new artist with the member information and add it to the output
                  const newArtist = createArtistRecord(
                    memberResponse.name,
                    memberResponse.id,
                    {
                      prev: memberReleasesResponse.pagination.urls?.prev,
                      next: memberReleasesResponse.pagination.urls?.next,
                      last: memberReleasesResponse.pagination.urls?.last,
                    },
                    memberReleasesResponse.releases,
                    memberResponse.roles ?? [""]
                  );
                  output.push(newArtist);
                }
              } catch (error) {
                console.error(
                  `Error fetching ${member.resource_url}: ${error}`
                );
              }
            }
          } else {
            // The artist has no members, so we must add the artist
            console.log(`${artist.name} has NO members`);

            // fetch their releases and count++
            const artistReleasesResponse = await fetchAndWait(
              `https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100`,
              settings.searchSpeeds[settings.searchType]
            );
            currentCount++;

            if (
              artistReleasesResponse &&
              artistReleasesResponse.releases &&
              artistReleasesResponse.pagination
            ) {
              const newArtist = createArtistRecord(
                artist.name,
                artist.id,
                {
                  prev: artistReleasesResponse.pagination.urls?.prev,
                  next: artistReleasesResponse.pagination.urls?.next,
                  last: artistReleasesResponse.pagination.urls?.last,
                },
                artistReleasesResponse.releases,
                artist.roles ?? [""]
              );
              output.push(newArtist);
            }
          }
        } catch (error) {
          console.error(`Error: ${error}`);
        }
      }
      temp = {
        ...temp,
        members: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      };
      setLoadingStates(temp);
      console.log(output);
      setData(output);
    } catch (error) {
      temp = {
        ...temp,
        connect: { isLoading: false, isComplete: false },
      };
      setLoadingStates(temp);
      console.log(error);
    }
  };

  const contributorReleases = async () => {
    let temp = {
      connect: { isLoading: true, isComplete: false },
      artists: { isLoading: false, isComplete: false },
      members: { isLoading: false, isComplete: false },
      credits: { isLoading: false, isComplete: false },
      records: { isLoading: false, isComplete: false },
    };
    setLoadingStates(temp);
    setMessage("Searching for album...");
    let callCount = 1;
    try {
      const response = await getSearchResult(band, album);
      await new Promise((resolve) =>
        setTimeout(resolve, settings.searchSpeeds[settings.searchType])
      );
      setMessage("Album located");
      let release;
      for (let i = 0; i < Math.min(5, response.results.length); i++) {
        const nextRelease = await fetch(response.results[i].resource_url).then(
          (res) => res.json()
        );
        callCount++;
        console.log(`Call Count: ${callCount}`);
        await new Promise((resolve) =>
          setTimeout(resolve, settings.searchSpeeds[settings.searchType])
        );

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
      let currentCount = callCount;
      const output = [];

      console.log(release);
      console.log(release.extraartists);

      if (!release.extraartists && release.extraartists.length === 0) {
        alert("couldn't locate a list of credited artists for this album :(");
        return [];
      }
      temp = {
        ...temp,
        connect: { isLoading: false, isComplete: true },
        credits: { isLoading: true, isComplete: false },
        records: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);
      // form a collection of relevant contributors and their roles
      const contributors = new Map();
      release.extraartists.forEach((extraArtist) => {
        if (
          !extraArtist.role.includes("Management") &&
          !extraArtist.role.includes("Photo") &&
          !extraArtist.role.includes("Translated") &&
          !extraArtist.role.includes("Art") &&
          !extraArtist.role.includes("Master")
        ) {
          const oldRoles = contributors.has(extraArtist.id)
            ? [...contributors.get(extraArtist.id).roles]
            : [];
          const newRoles = extraArtist.role
            .split(",")
            .map((element) => element.trim());
          contributors.set(extraArtist.id, {
            id: extraArtist.id,
            name: extraArtist.name,
            link: extraArtist.resource_url,
            roles: [...oldRoles, ...newRoles],
          });
        }
      });
      console.log(contributors);

      // for each contributor
      for (const contributor of [...contributors.values()]) {
        if (settings.searchType === "fast" && currentCount >= callLimit - 2)
          break;
        try {
          // fetch their information
          const contributorResponse = await fetch(contributor.link).then(
            (res) => res.json()
          );
          currentCount++;
          console.log(`Call Count: ${currentCount}`);
          console.log(contributorResponse);

          // fetch their releases and count++
          const contributorReleasesResponse = await fetch(
            `https://api.discogs.com/artists/${contributorResponse.id}/releases?page=1&per_page=100`
          ).then((res) => res.json());
          currentCount++;
          console.log(`Call Count: ${currentCount}`);
          await new Promise((resolve) =>
            setTimeout(resolve, settings.searchSpeeds[settings.searchType])
          );

          // Check that the contributor release response is properly formatted
          if (
            contributorReleasesResponse &&
            contributorReleasesResponse.releases &&
            contributorReleasesResponse.pagination
          ) {
            // Create a new artist with the contributor information and add it to the output
            const newArtist = createArtistRecord(
              contributor.name,
              contributor.id,
              {
                prev: contributorReleasesResponse.pagination.urls?.prev,
                next: contributorReleasesResponse.pagination.urls?.next,
                last: contributorReleasesResponse.pagination.urls?.last,
              },
              contributorReleasesResponse.releases,
              contributor.roles ?? [""]
            );
            output.push(newArtist);
          }
        } catch (error) {
          console.log(`Error: ${error}`);
        }
      }
      console.log(output);
      temp = {
        ...temp,
        credits: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      };
      setLoadingStates(temp);
      setData(output);
    } catch (error) {
      console.log(error);
      temp = {
        ...temp,
        credits: { isLoading: false, isComplete: false },
        records: { isLoading: false, isComplete: false },
      };
      setLoadingStates(temp);
    }
  };

  const loadMore = async (data, relation) => {
    let temp = {
      connect: { isLoading: false, isComplete: false },
      artists: { isLoading: false, isComplete: false },
      members: { isLoading: false, isComplete: false },
      credits: { isLoading: false, isComplete: false },
      records: { isLoading: true, isComplete: false },
    };
    setLoadingStates(temp);
    let currentCount = 0;
    const output = [];
    for (const artist of data) {
      if (artist.pagination[relation] === undefined) {
        output.push({
          ...artist,
          pagination: {
            ...artist.pagination,
            prev: artist.pagination.last,
            last: artist.pagination.last,
          },
          releases: [],
        });
      } else {
        if (settings.searchType === "fast" && currentCount >= callLimit - 1)
          break;
        const artistReleases = await fetch(artist.pagination[relation])
          .then((res) => res.json())
          .catch((err) => console.log(err));
        await new Promise((resolve) =>
          setTimeout(resolve, settings.searchSpeeds[settings.searchType])
        );
        if (
          artistReleases &&
          artistReleases.releases &&
          artistReleases.pagination
        ) {
          const newArtist = createArtistRecord(
            artist.name,
            artist.id,
            {
              prev: artistReleases.pagination.urls?.prev,
              next: artistReleases.pagination.urls?.next,
              last: artist.pagination.last,
            },
            artistReleases.releases,
            artist.roles ?? [""]
          );
          output.push(newArtist);
        }
      }
    }
    temp = {
      ...temp,
      records: { isLoading: false, isComplete: true },
    };
    setLoadingStates(temp);
    return output;
  };

  const loadLast = async () => {
    const moreReleases = await loadMore(data, "prev");
    setData(moreReleases);
  };

  const loadNext = async () => {
    const moreReleases = await loadMore(data, "next");
    setData(moreReleases);
  };

  const toggleSettingsModal = async () => {
    const isOpen = displaySettings;
    setDisplaySettings(!isOpen);
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
    console.log(data, displayResults);
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
          <StyledLoadingBarWrapper className="progress-block">
            <LoadingBar
              isLoading={loadingStates.connect.isLoading}
              isComplete={loadingStates.connect.isComplete}
              text="CONNECT"
            />
            <LoadingBar
              isLoading={loadingStates.artists.isLoading}
              isComplete={loadingStates.artists.isComplete}
              text="ARTISTS"
            />
            <LoadingBar
              isLoading={loadingStates.members.isLoading}
              isComplete={loadingStates.members.isComplete}
              text="MEMBERS"
            />
            <LoadingBar
              isLoading={loadingStates.credits.isLoading}
              isComplete={loadingStates.credits.isComplete}
              text="CREDITS"
            />
            <LoadingBar
              isLoading={loadingStates.records.isLoading}
              isComplete={loadingStates.records.isComplete}
              text="RECORDS"
            />
          </StyledLoadingBarWrapper>
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
            <StyledInput
              placeholder="Band"
              onChange={onChange}
              name="band"
              value={band}
            ></StyledInput>
            <StyledInput
              placeholder="Album"
              onChange={onChange}
              name="album"
              value={album}
            ></StyledInput>
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
              <button onClick={bandReleases}>Search</button>
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
              <button onClick={memberReleases}>Search</button>
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
              <button onClick={contributorReleases}>Search</button>
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
      </div>
    </>
  );
}

export default App;
