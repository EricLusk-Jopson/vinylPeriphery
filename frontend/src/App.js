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
import { getPages } from "./helpers/getPages";
import { artistSearchCopy, creditSearchCopy, memberSearchCopy } from "./helpers/magicStrings";

function App() {
  const [data, setData] = useState([]);
  const [displayResults, setDisplayResults] = useState([]);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [settings, setSettings] = useState({
    searchType: "fast",
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
  });
  const [loadingStates, setLoadingStates] = useState({
    connect: { isLoading: false, isComplete: false },
    artists: { isLoading: false, isComplete: false },
    members: { isLoading: false, isComplete: false },
    credits: { isLoading: false, isComplete: false },
    records: { isLoading: false, isComplete: false },
  });
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
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

  const convertStringToBoolean = (str) => {
    if (str === "true") return true;
    else return false;
  };

  const resetSearch = (message) => {
    let temp = {
      connect: { isLoading: false, isComplete: false },
      artists: { isLoading: false, isComplete: false },
      members: { isLoading: false, isComplete: false },
      credits: { isLoading: false, isComplete: false },
      records: { isLoading: false, isComplete: false },
    };
    setLoadingStates(temp);
    setActiveSearch("");
    setMessage(message);
  };

  const bandReleases = async () => {
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }
    const searchFlag = settings.searchType === "fast" ? true : false;
    setActiveSearch("band");
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
      if (response.results.length <= 0) {
        resetSearch("No release was found using the provided band and album");
        return;
      }
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
        artists: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);

      let callCount = 2;
      setMessage(
        `Checking releases associated with ${release.artists.length} artist${
          release.artists.length > 1 && "s"
        }.`
      );
      let currentCount = callCount;

      const output = [];
      temp = {
        ...temp,
        records: { isLoading: true, isComplete: false },
      };
      setLoadingStates(temp);

      let artistInc = 1;
      // for every artist recorded in the response
      for (const artist of release.artists) {
        if (settings.searchType === "fast" && currentCount >= callLimit - 2) {
          setMessage("call limit exceeded. Terminating search...");
          break;
        }

        try {
          // fetch their information
          setMessage(
            `searching for artist ${artist.name} (${artistInc} / ${release.artists.length})...`
          );
          const artistResponse = await fetchAndWait(
            artist.resource_url,
            settings.searchSpeeds[settings.searchType]
          );
          currentCount++;

          // fetch their releases
          setMessage(
            `fetching releases for artist ${artist.name} (${artistInc} / ${release.artists.length})...`
          );
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
            const pages =
              releasesResponse.pagination.urls?.last !== undefined
                ? releasesResponse.pagination.urls?.last?.split(/(\=|\&)/)[2]
                : 1;
            const newArtist = createArtistRecord(
              artist.name,
              artist.id,
              getPages(releasesResponse),
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
          setLoadingStates(temp);
        } catch (error) {
          console.error(`Error: ${error}`);
          temp = {
            ...temp,
            artists: { isLoading: false, isComplete: false },
            records: { isLoading: false, isComplete: false },
          };
          setActiveSearch("");
          setMessage(
            "an error was encountered fetching artist releases. Please try again"
          );
          setLoadingStates(temp);
        }
        artistInc++;
      }
      setData(output);
      if (searchFlag) {
        setCooldown(true);
      }
      setPage(1);
      setActiveSearch("");
    } catch (error) {
      resetSearch("An error occurred while connecting.");
    }
  };

  const memberReleases = async () => {
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }
    const searchFlag = settings.searchType === "fast" ? true : false;
    setActiveSearch("member");
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
      if (response.results.length <= 0) {
        resetSearch("No release was found using the provided band and album");
        return;
      }
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
        `Checking releases associated with ${release.artists.length} artist${
          release.artists.length > 1 && "s"
        }.`
      );
      let currentCount = callCount;
      const output = [];
      let artistInc = 1;
      // for every artist recorded in the response
      for (const artist of release.artists) {
        if (settings.searchType === "fast" && currentCount >= callLimit) break;
        setMessage(
          `searching for artist ${artist.name} (${artistInc} / ${release.artists.length})...`
        );

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
            let memberInc = 1;
            for (const member of artistResponse.members) {
              if (
                settings.searchType === "fast" &&
                currentCount >= callLimit - 2
              ) {
                setMessage("call limit exceeded. Terminating search...");
                break;
              }

              try {
                // fetch their information and count++
                setMessage(
                  `searching for member ${member.name} of ${artist.name} (${memberInc} / ${artistResponse.members?.length})...`
                );
                const memberResponse = await fetchAndWait(
                  member.resource_url,
                  settings.searchSpeeds[settings.searchType]
                );
                currentCount++;

                // fetch their releases and count++
                setMessage(
                  `fetching releases for member ${member.name} of ${artist.name} (${memberInc} / ${artistResponse.members?.length})...`
                );
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
                    getPages(memberReleasesResponse),
                    memberReleasesResponse.releases,
                    memberResponse.roles ?? [""]
                  );
                  output.push(newArtist);
                }
              } catch (error) {
                console.error(
                  `Error fetching ${member.resource_url}: ${error}`
                );
                setActiveSearch("");
                setMessage(
                  "an error was encountered fetching member releases. Please try again"
                );
                temp = {
                  ...temp,
                  connect: { isLoading: false, isComplete: false },
                  members: { isLoading: false, isComplete: false },
                  records: { isLoading: false, isComplete: false },
                };
                setLoadingStates(temp);
              }
              memberInc++;
            }
          } else {
            // The artist has no members, so we must add the artist

            // fetch their releases and count++
            setMessage(
              `fetching releases for artist ${artist.name} (${artistInc} / ${release.artists.length})...`
            );
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
                getPages(artistReleasesResponse),
                artistReleasesResponse.releases,
                artist.roles ?? [""]
              );
              output.push(newArtist);
            }
          }
        } catch (error) {
          setActiveSearch("");
          setMessage(
            "an error was encountered fetching artists. Please try again"
          );
          temp = {
            ...temp,
            connect: { isLoading: false, isComplete: false },
            members: { isLoading: false, isComplete: false },
            records: { isLoading: false, isComplete: false },
          };
          setLoadingStates(temp);
          console.error(`Error: ${error}`);
        }
        artistInc++;
      }
      temp = {
        ...temp,
        members: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      };
      setLoadingStates(temp);
      setData(output);
      if (searchFlag) {
        setCooldown(true);
      }
      setPage(1);
      setActiveSearch("");
    } catch (error) {
      resetSearch(
        "an error was encountered while connecting. Please try again"
      );
    }
  };

  const contributorReleases = async () => {
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }
    const searchFlag = settings.searchType === "fast" ? true : false;
    setActiveSearch("contributor");
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
        const oldRoles = contributors.has(extraArtist.id)
          ? [...contributors.get(extraArtist.id).roles]
          : [];
        const newRoles = extraArtist.role
          .split(",")
          .map((element) => element.trim());
        const exclusions = [...settings.excludedRoles];
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
              getPages(contributorReleasesResponse),
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
      temp = {
        ...temp,
        credits: { isLoading: false, isComplete: true },
        records: { isLoading: false, isComplete: true },
      };
      setLoadingStates(temp);
      setData(output);
      if (searchFlag) {
        setCooldown(true);
      }
      setActiveSearch("");
      setPage(1);
    } catch (error) {
      resetSearch("An error occurred while connecting.");
    }
  };

  const loadMore = async () => {
    const newPage = page + 1;
    const searchFlag = settings.searchType === "fast" ? true : false;
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
    let artistInc = 1;
    for (const artist of data) {
      if (artist.pages >= newPage) {
        if (settings.searchType === "fast" && currentCount >= callLimit - 1) {
          setMessage("Call limit exceeded. Terminating....");
          break;
        }
        setMessage(
          `Retrieving releases for ${artist.name} (${artistInc} / ${data.length})`
        );
        const artistReleases = await fetch(
          `https://api.discogs.com/artists/${artist.id}/releases?page=${newPage}&per_page=100`
        )
          .then((res) => res.json())
          .catch((err) => console.log(err));
        await new Promise((resolve) =>
          setTimeout(resolve, settings.searchSpeeds[settings.searchType])
        );
        if (artistReleases && artistReleases.releases) {
          const newArtist = createArtistRecord(
            artist.name,
            artist.id,
            artist.pages,
            [...artist.releases, ...artistReleases.releases],
            artist.roles ?? [""]
          );
          output.push(newArtist);
        }
      } else {
        output.push(artist);
      }
      artistInc++;
    }
    temp = {
      ...temp,
      records: { isLoading: false, isComplete: true },
    };
    setLoadingStates(temp);
    if (searchFlag) {
      setCooldown(true);
    }
    setActiveSearch("");
    setData(output);
    setPage(newPage);
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
            setLoadingStates({
              connect: { isLoading: false, isComplete: false },
              artists: { isLoading: false, isComplete: false },
              members: { isLoading: false, isComplete: false },
              credits: { isLoading: false, isComplete: false },
              records: { isLoading: false, isComplete: false },
            });
          }, 60000)
        );
      }
    }
    coolDownAfterFastSearch();
  }, [coolDown]);

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
          coolDown={coolDown}
          disableLoadMore={data.every((artist) => artist.pages <= page)}
          loadMore={loadMore}
          active={activeSearch !== ""}
        />
      </div>
    </>
  );
}

export default App;
