import MediaQuery from "react-responsive";
import { IconButton } from "@mui/material";
import NavigateBefore from "@mui/icons-material/ArrowLeft";
import NavigateNext from "@mui/icons-material/ArrowRight";
import { useState, useEffect, React } from "react";
import {
  getSearchResult,
  createArtistRecord,
  fetchAndWait,
} from "./helpers/asyncCalls";
import { callLimit, mobileScreenWidth } from "./helpers/magicNumbers";
import LoadingBar from "./components/LoadingBar";
import { StyledLoadingBarWrapper } from "./components/styles/LoadingBar.styled";
import { StyledInput } from "./components/styles/Input";
import SearchCard from "./components/SearchCard";
import Settings from "./components/Settings";
import Results from "./components/Results";
import { CoolDownTimer } from "./components/styles/CoolDownTimer.styled";
import {
  artistSearchCopy,
  creditSearchCopy,
  memberSearchCopy,
} from "./helpers/magicStrings";
import { convertStringToBoolean } from "./helpers/convertStringToBoolean";
import { getDefaultLoadingStates } from "./helpers/defaults";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [settings, setSettings] = useState({
    searchType: "fast",
    excludeProduction: "false",
    excludeArtist: "true",
    excludeAlbum: "true",
    excludeVarious: "false",
    excludeSolo: "false",
    searchSpeeds: {
      fast: 100,
      comprehensive: 3200,
    },
    excludedRoles: [
      "art",
      "photo",
      "coordinator",
      "translated",
      "assemblage",
      "manager",
    ],
    productionRoles: [
      "a&r",
      "audio",
      "record",
      "mixed",
      "master",
      "produced",
      "production",
      "assistant",
      "creative",
      "director",
      "lacquer cut",
      "engineer",
    ],
  });
  const [loadingStates, setLoadingStates] = useState(getDefaultLoadingStates());
  const [message, setMessage] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [coolDown, setCooldown] = useState(false);
  const [formData, setFormData] = useState({
    band: "",
    album: "",
  });
  const { band, album } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const updateLoadingStates = (updates) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      ...updates,
    }));
  };

  const resetSearch = (message) => {
    updateLoadingStates(getDefaultLoadingStates());
    setActiveSearch("");
    setMessage(message);
  };

  const bandReleases = async () => {
    // guard clause for empty form
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }

    // initialize variables and defaults
    let projectResult;
    let releaseResult;

    setActiveSearch("band");
    updateLoadingStates({
      ...getDefaultLoadingStates(),
      connect: { isLoading: true, isComplete: false },
    });
    setMessage("Searching for album...");

    // try to get searchResult from form inputs. Reset search on HTTP error or no results
    try {
      projectResult = await getSearchResult(band, album);
      if (projectResult?.results.length <= 0) {
        resetSearch("No release was found using the provided band and album.");
        return;
      }
    } catch (error) {
      console.error(`Error in getSearchResult: ${error}`);
      resetSearch("Could not connect to the database.");
      return;
    }

    // search succeeded: project was located. Wait the appropriate amount of time to obey rate limits
    setMessage("Album located.");

    await new Promise((resolve) =>
      setTimeout(resolve, settings.searchSpeeds[settings.searchType])
    );

    // move on to next step in the search
    setMessage("Retrieving album info...");

    // attempt to retrieve futher information the first match returned by the project search
    // on success, this will provide us with a specific release's information
    try {
      releaseResult = await fetchAndWait(
        projectResult.results[0].resource_url,
        settings.searchSpeeds[settings.searchType]
      );
    } catch (error) {
      console.error(`Error in fetchAndWait on release: ${error}`);
      resetSearch("No album info could be retrieved.");
      return;
    }

    // successfully retrieved a valid release
    updateLoadingStates({
      connect: { isLoading: false, isComplete: true },
      artists: { isLoading: true, isComplete: false },
    });
    setMessage(
      `Checking releases associated with ${
        releaseResult.artists.length
      } artist${releaseResult.artists.length > 1 && "s"}.`
    );

    // initialize the callcounter, which helps us obey rate limits when fast search is enabled
    let callCount = 2;
    let currentCount = callCount;

    const output = [];
    updateLoadingStates({ records: { isLoading: true, isComplete: false } });

    // for each artist associated with the release, attempt to fetch their discography
    // initialize artist counter for reporting purposes
    let artistInc = 1;
    for (const artist of releaseResult.artists) {
      // from here, there are two new queries to be made.
      // If our callCounter is within two calls of the limit, we abort.
      if (settings.searchType === "fast" && currentCount >= callLimit - 2) {
        setMessage("call limit exceeded. Terminating search...");
        break;
      }

      // attempt our two queries
      let artistResult;
      let artistReleasesResult;

      // attempt to retrieve the current artist's info. if none, or if error, continue to next iteration of the loop.
      try {
        setMessage(
          `searching for artist ${artist.name} (${artistInc} / ${releaseResult.artists.length})...`
        );
        artistResult = await fetchAndWait(
          artist.resource_url,
          settings.searchSpeeds[settings.searchType]
        );
        currentCount++;
      } catch (error) {
        console.error(`Error: ${error}`);
        resetSearch(
          `an error was encountered fetching artist records for ${artist.name}.`
        );
        continue;
      }

      // attempt to retrieve the current artist's releases. if none, or if error, continue tonnext iteration of the loop.
      try {
        setMessage(
          `fetching releases for artist ${artist.name} (${artistInc} / ${releaseResult.artists.length})...`
        );
        artistReleasesResult = await fetchAndWait(
          `https://api.discogs.com/artists/${artistResult.id}/releases?page=1&per_page=100`,
          settings.searchSpeeds[settings.searchType]
        );
        currentCount++;
      } catch (error) {
        console.error(`Error: ${error}`);
        resetSearch(
          `an error was encountered fetching artist's releases records for ${artist.name}.`
        );
        continue;
      }

      // successfully retrieved the current artist's releases
      // create new artist object from the retrieved information and push it to the output array
      if (artistReleasesResult && artistReleasesResult.releases) {
        const newArtist = createArtistRecord(
          artist.name,
          artist.id,
          artistReleasesResult.releases,
          artist.roles ?? [""]
        );
        output.push(newArtist);
      }

      // update, increment artist counter and end the loop
      updateLoadingStates({
        artists: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      });
      artistInc++;
    }

    // loop completed, set data and begin the cooldown if searchType was fast
    setData(output);
    if (settings.searchType === "fast") {
      setCooldown(true);
    }
    resetSearch("");
    return;
  };

  const memberReleases = async () => {
    // Guard clause for empty form
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }

    // initialize variables and defaults
    let projectResult;
    let releaseResult;

    setActiveSearch("member");
    updateLoadingStates({
      ...getDefaultLoadingStates(),
      connect: { isLoading: true, isComplete: false },
    });
    setMessage("Searching for album...");

    // try to get the searchResult from form inputs. Reset search on HTTP error or no results
    try {
      projectResult = await getSearchResult(band, album);
      if (projectResult.results.length <= 0) {
        resetSearch("No release was found using the provided band and album");
        return;
      }
    } catch (error) {
      console.error(`Error in getSearchResult: ${error}`);
      resetSearch("Could not connect to the database.");
      return;
    }

    // search succeeded: project was located. Wait the appropriate amount of time to obey rate limits
    setMessage("Album located");

    await new Promise((resolve) =>
      setTimeout(resolve, settings.searchSpeeds[settings.searchType])
    );

    // move on to next step in the search
    setMessage("Retrieving album info...");

    // attempt to retrieve futher information the first match returned by the project search
    // on success, this will provide us with a specific release's information
    try {
      releaseResult = await fetchAndWait(
        projectResult.results[0].resource_url,
        settings.searchSpeeds[settings.searchType]
      );
    } catch (error) {
      console.error(`Error in fetchAndWait on release: ${error}`);
      resetSearch("No album info could be retrieved.");
      return;
    }

    // successfully restrieved a valid release
    updateLoadingStates({
      connect: { isLoading: false, isComplete: true },
      members: { isLoading: true, isComplete: false },
    });
    setMessage(
      `Checking releases associated with ${
        releaseResult.artists.length
      } artist${releaseResult.artists.length > 1 && "s"}.`
    );

    // initialize the callcounter, which helps us obey rate limits when fast search is enabled
    let callCount = 2;
    let currentCount = callCount;

    const output = [];
    updateLoadingStates({ records: { isLoading: true, isComplete: false } });

    // for each artist associated with the release, attempt to fetch their discography
    // initialize artist counter for reporting purposes
    let artistInc = 1;
    for (const artist of releaseResult.artists) {
      // from here, there are at least three new queries to be made.
      // if our callCounter is within three calls of the limit, we abort.
      if (settings.searchType === "fast" && currentCount >= callLimit - 3) {
        setMessage("call limit exceeded. Terminating search...");
        break;
      }

      // attempt our query
      let artistResult;

      // attempt to retrieve the current artist's info. if none, or if error, continue tonnext iteration of the loop.
      try {
        setMessage(
          `searching for artist ${artist.name} (${artistInc} / ${releaseResult.artists.length})...`
        );
        artistResult = await fetchAndWait(
          artist.resource_url,
          settings.searchSpeeds[settings.searchType]
        );
        currentCount++;
      } catch (error) {
        console.error(`Error: ${error}`);
        resetSearch(
          `an error was encountered fetching artist records for ${artist.name}.`
        );
        continue;
      }

      // attempt to retrieve the current artist's members.
      if (artistResult.hasOwnProperty("members")) {
        // for each member associated with the artist, attempt to fetch their discography
        // initialize member counter for reporting purposes
        let memberInc = 1;
        for (const member of artistResult.members) {
          // from here, there are two new queries to be made.
          // If our callCounter is within two calls of the limit, we abort.
          if (settings.searchType === "fast" && currentCount >= callLimit - 2) {
            setMessage("call limit exceeded. Terminating search...");
            break;
          }

          // attempt our two queries
          let memberResult;
          let memberReleasesResult;

          // attempt to retrieve the current member's info. if none, or if error, continue to next iteration of the loop.
          try {
            setMessage(
              `searching for member ${member.name} of ${artist.name} (${memberInc} / ${artistResult.members?.length})...`
            );
            memberResult = await fetchAndWait(
              member.resource_url,
              settings.searchSpeeds[settings.searchType]
            );
            currentCount++;
          } catch (error) {
            console.error(`Error: ${error}`);
            resetSearch(
              `an error was encountered fetching member records for ${member.name}.`
            );
            continue;
          }

          // attempt to retrieve the current artist's releases. if none, or if error, continue to next iteration of the loop.
          try {
            setMessage(
              `fetching releases for member ${member.name} of ${artist.name} (${memberInc} / ${artistResult.members?.length})...`
            );
            memberReleasesResult = await fetchAndWait(
              `https://api.discogs.com/artists/${memberResult.id}/releases?page=1&per_page=100`,
              settings.searchSpeeds[settings.searchType]
            );
            currentCount++;
          } catch (error) {
            console.error(`Error: ${error}`);
            resetSearch(
              `an error was encountered fetching member's releases records for ${member.name}.`
            );
            continue;
          }

          // successfully retrieved the current artist's member's releases
          // create new artist object from the retrieved information and push it to the output array
          if (memberReleasesResult && memberReleasesResult.releases) {
            const newArtist = createArtistRecord(
              memberResult.name,
              memberResult.id,
              memberReleasesResult.releases,
              memberResult.roles ?? [""]
            );
            output.push(newArtist);
          }

          memberInc++;
        }
        updateLoadingStates({
          members: { isLoading: false, isComplete: true },
          records: { isLoading: false, isComplete: true },
        });
      } else {
        // The artist has no members, so we must add the artist
        let artistReleasesResult;

        // attempt to retrieve the current artist's releases. if none, or if error, continue tonnext iteration of the loop.
        try {
          setMessage(
            `fetching releases for artist ${artist.name} (${artistInc} / ${releaseResult.artists.length})...`
          );
          artistReleasesResult = await fetchAndWait(
            `https://api.discogs.com/artists/${artistResult.id}/releases?page=1&per_page=100`,
            settings.searchSpeeds[settings.searchType]
          );
          currentCount++;
        } catch (error) {
          console.error(`Error: ${error}`);
          resetSearch(
            `an error was encountered fetching artist's releases records for ${artist.name}.`
          );
          continue;
        }

        // successfully retrieved the current artist's releases
        // create new artist object from the retrieved information and push it to the output array
        if (artistReleasesResult && artistReleasesResult.releases) {
          const newArtist = createArtistRecord(
            artist.name,
            artist.id,
            artistReleasesResult.releases,
            artist.roles ?? [""]
          );
          output.push(newArtist);
        }
      }

      // update, increment artist counter and end the loop
      updateLoadingStates({
        members: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      });
      artistInc++;
    }

    // loop completed, set data and begin the cooldown if searchType was fast
    setData(output);
    if (settings.searchType === "fast") {
      setCooldown(true);
    }
    resetSearch("");
    return;
  };

  const contributorReleases = async () => {
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }

    const searchFlag = settings.searchType === "fast" ? true : false;
    setActiveSearch("contributor");
    updateLoadingStates({
      ...getDefaultLoadingStates(),
      connect: { isLoading: true, isComplete: false },
    });
    setMessage("Searching for album...");
    let callCount = 1;
    try {
      const response = await getSearchResult(band, album);
      if (response.results.length <= 0) {
        resetSearch("No release was found using the provided band and album");
        return;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, settings.searchSpeeds[settings.searchType])
      );
      let release = { extraartists: [] };

      for (let i = 0; i < Math.min(5, response.results.length); i++) {
        setMessage(`Checking for credited artists on result ${i + 1}`);
        const nextRelease = await fetch(response.results[i].resource_url).then(
          (res) => res.json()
        );
        callCount++;
        await new Promise((resolve) =>
          setTimeout(resolve, settings.searchSpeeds[settings.searchType])
        );

        if (
          nextRelease.extraartists &&
          nextRelease.extraartists.length >= release.extraartists.length
        ) {
          release = nextRelease;
        }
      }
      setMessage(
        `Checking releases associated with ${
          release.extraartists.length
        } contributor${release.extraartists.length > 1 && "s"}.`
      );
      let currentCount = callCount;
      const output = [];

      if (!release.extraartists || release.extraartists.length === 0) {
        resetSearch(
          "Couldn't locate a list of credited artists for this album :("
        );
        return [];
      }
      updateLoadingStates({
        connect: { isLoading: false, isComplete: true },
        credits: { isLoading: true, isComplete: false },
        records: { isLoading: true, isComplete: false },
      });
      // form a collection of relevant contributors and their roles
      const contributors = new Map();
      release.extraartists.forEach((extraArtist) => {
        const oldRoles = contributors.has(extraArtist.id)
          ? [...contributors.get(extraArtist.id).roles]
          : [];
        const newRoles = extraArtist.role
          .split(",")
          .map((element) => element.trim());
        const exclusions = [...settings.excludedRoles];
        if (settings.excludeProduction) {
          exclusions.push(...settings.productionRoles);
        }
        if (newRoles.length > 0) {
          for (let i = 0; i < newRoles.length; i++) {
            for (let j = 0; j < exclusions.length; j++) {
              if (newRoles[i].toLowerCase().includes(exclusions[j])) {
                newRoles.splice(i, 1);
                i--;
                break;
              }
            }
          }
          if (newRoles.length > 0) {
            contributors.set(extraArtist.id, {
              id: extraArtist.id,
              name: extraArtist.name,
              link: extraArtist.resource_url,
              roles: [...oldRoles, ...newRoles],
            });
          }
        }
      });

      // for each contributor
      let contributorInc = 1;
      for (const contributor of [...contributors.values()]) {
        if (settings.searchType === "fast" && currentCount >= callLimit - 2) {
          setMessage("Too many API calls. Aborting...");
          break;
        }
        try {
          // fetch their information
          setMessage(
            `Checking contributor ${contributorInc} of ${contributors.size}.`
          );
          const contributorResponse = await fetch(contributor.link).then(
            (res) => res.json()
          );
          currentCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, settings.searchSpeeds[settings.searchType])
          );

          // fetch their releases and count++
          setMessage(
            `fetching releases for contributor ${contributorInc} of ${contributors.size}.`
          );
          const contributorReleasesResponse = await fetch(
            `https://api.discogs.com/artists/${contributorResponse.id}/releases?page=1&per_page=100`
          ).then((res) => res.json());
          currentCount++;
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
              contributorReleasesResponse.releases,
              contributor.roles ?? [""]
            );
            output.push(newArtist);
          }
        } catch (error) {
          resetSearch("an error occurred while fetching contributors");
          break;
        }
        contributorInc++;
      }
      updateLoadingStates({
        credits: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      });
      setData(output);
      if (searchFlag) {
        setCooldown(true);
      }
      resetSearch("");
    } catch (error) {
      resetSearch("An error occurred while connecting.");
    }
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
    setMessage(`displaying ${displayResults.length} records`);
  }, [displayResults]);

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
    if (convertStringToBoolean(settings.excludeSolo)) {
      filteredReleases = filteredReleases.filter(
        (release) => release.contributors.length > 1
      );
    }

    setDisplayResults(
      filteredReleases.sort(
        (a, b) => b.contributors.length - a.contributors.length
      )
    );
  }, [data, settings]);

  useEffect(() => {
    async function coolDownAfterFastSearch() {
      if (coolDown) {
        await new Promise(() =>
          setTimeout(() => {
            setCooldown(false);
            updateLoadingStates({ ...getDefaultLoadingStates() });
          }, 60000)
        );
      }
    }
    coolDownAfterFastSearch();
  }, [coolDown]);

  // Code related to the traversal of search options on smaller viewports
  const cards = [
    {
      title: "Artist",
      body: artistSearchCopy,
      btnFnc: bandReleases,
      active: activeSearch === "band",
      disabled: (activeSearch !== "" && activeSearch !== "band") || coolDown,
    },
    {
      title: "Members",
      body: memberSearchCopy,
      btnFnc: memberReleases,
      active: activeSearch === "member",
      disabled: (activeSearch !== "" && activeSearch !== "member") || coolDown,
    },
    {
      title: "Credits",
      body: creditSearchCopy,
      btnFnc: contributorReleases,
      active: activeSearch === "contributor",
      disabled:
        (activeSearch !== "" && activeSearch !== "contributor") || coolDown,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + cards.length) % cards.length
    );
  };

  return (
    <>
      <div
        className="app"
        style={{
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
          fontFamily: "Monda",
        }}
      >
        <div
          className="upper-search"
          style={{
            backgroundColor: "#111",
            position: "relative",
            height: "50vh",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <MediaQuery minWidth={mobileScreenWidth}>
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
          </MediaQuery>
          <div
            className="input-block"
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              flexGrow: 1,
              alignItems: "center",
              justifyContent: "end",
              marginBottom: "60px",
            }}
          >
            <StyledInput
              text="Album"
              placeholder="Album"
              onChange={onChange}
              name="album"
              value={album}
            ></StyledInput>
            <StyledInput
              text="Artist"
              placeholder="Band"
              onChange={onChange}
              name="band"
              value={band}
            ></StyledInput>
          </div>
          <Settings
            settings={settings}
            handleSettingsChange={handleSettingsChange}
            toggleSettingsModal={toggleSettingsModal}
            displaySettings={displaySettings}
          />
        </div>
        <div
          className="lower-search"
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
            backgroundColor: "black",
            color: "white",
            paddingTop: "3px",
            boxSizing: "border-box",
            overflowY: "auto",
          }}
        >
          <MediaQuery maxWidth={mobileScreenWidth}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
              }}
            >
              <IconButton
                onClick={handlePrev}
                style={{
                  color: "inherit",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <NavigateBefore />
              </IconButton>
              {cards.map((card, index) => (
                <div
                  key={index}
                  style={{ display: index === currentIndex ? "block" : "none" }}
                >
                  <SearchCard
                    title={card.title}
                    body={card.body}
                    btnFnc={card.btnFnc}
                    active={card.active}
                    disabled={card.disabled}
                  />
                </div>
              ))}
              <IconButton
                onClick={handleNext}
                style={{
                  color: "inherit",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <NavigateNext />
              </IconButton>
            </div>
          </MediaQuery>

          <MediaQuery minWidth={mobileScreenWidth + 1}>
            <SearchCard
              title="Artist"
              body={artistSearchCopy}
              btnFnc={bandReleases}
              active={activeSearch === "band"}
              disabled={
                (activeSearch !== "" && activeSearch !== "band") || coolDown
              }
            />
            <SearchCard
              title="Members"
              body={memberSearchCopy}
              btnFnc={memberReleases}
              active={activeSearch === "member"}
              disabled={
                (activeSearch !== "" && activeSearch !== "member") || coolDown
              }
            />
            <SearchCard
              title="Credits"
              body={creditSearchCopy}
              btnFnc={contributorReleases}
              active={activeSearch === "contributor"}
              disabled={
                (activeSearch !== "" && activeSearch !== "contributor") ||
                coolDown
              }
            />
          </MediaQuery>
        </div>
        <CoolDownTimer coolDown={coolDown} />
        <Results
          data={data}
          displayResults={displayResults}
          message={message}
          active={activeSearch !== ""}
        />
      </div>
    </>
  );
}

export default App;
