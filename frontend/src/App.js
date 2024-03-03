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
import {
  StyledApp,
  StyledInputBlock,
  StyledLowerSearch,
  StyledSearchCarousel,
  StyledUpperSeach,
} from "./components/styles/App.styled";
import { IconButtonStyles } from "./components/styles/MuiStyles";

function App() {
  const [artistData, setArtistData] = useState([]);
  const [releasesData, setReleasesData] = useState([]);
  const [rolesData, setRolesData] = useState([]);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [settings, setSettings] = useState({
    searchType: "fast",
    excludeProduction: "true",
    excludeCorporate: "true",
    excludeOtherMedia: "true",
    excludeArtist: "true",
    excludeAlbum: "true",
    excludeVarious: "false",
    excludeSolo: "false",
    searchSpeeds: {
      fast: 100,
      comprehensive: 3200,
    },
    displayRoles: "false",
    corporateRoles: ["assemblage", "coordinator", "manager", "translated"],
    productionRoles: [
      "a&r",
      "assistant",
      "audio",
      "design",
      "engineer",
      "lacquer cut by",
      "mastered by",
      "mixed by",
      "producer",
      "produced by",
      "production",
      "programmed by",
      "record",
      "recorded by",
      "technician",
    ],
    otherMediaRoles: [
      "art",
      "art direction",
      "artwork",
      "creative director",
      "design",
      "performer",
      "photo",
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
    setRolesData([]);
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
          artist.roles ?? []
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
    setArtistData(output);
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
    let callCount = 0;

    setActiveSearch("member");
    setRolesData([]);
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
    callCount++;
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
      callCount++;
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

    const output = [];
    updateLoadingStates({ records: { isLoading: true, isComplete: false } });

    // for each artist associated with the release, attempt to fetch their discography
    // initialize artist counter for reporting purposes
    let artistInc = 1;
    for (const artist of releaseResult.artists) {
      // from here, there are at least three new queries to be made.
      // if our callCounter is within three calls of the limit, we abort.
      if (settings.searchType === "fast" && callCount >= callLimit - 3) {
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
        callCount++;
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
          if (settings.searchType === "fast" && callCount >= callLimit - 2) {
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
            callCount++;
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
            callCount++;
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
              memberResult.roles ?? []
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
          callCount++;
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
            artist.roles ?? []
          );
          output.push(newArtist);
        }
      }

      artistInc++;
    }

    updateLoadingStates({
      members: { isLoading: false, isComplete: true },
      records: { isLoading: false, isComplete: true },
    });

    // loop completed, set data and begin the cooldown if searchType was fast
    setArtistData(output);
    if (settings.searchType === "fast") {
      setCooldown(true);
    }
    resetSearch("");
    return;
  };

  const contributorReleases = async () => {
    // Guard clause for empty form
    if (band === "" || album === "") {
      resetSearch("Please enter a band and album");
      return;
    }

    // initialize variables and defaults
    let projectResult;
    let callCount = 0;

    setActiveSearch("contributor");
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
    callCount++;
    await new Promise((resolve) =>
      setTimeout(resolve, settings.searchSpeeds[settings.searchType])
    );

    // move on to next step in the search
    setMessage("Selecting optimal record for contributor search...");

    let release = { extraartists: [] };

    // check up to five releases for the one with the most contributors
    for (let i = 0; i < Math.min(5, projectResult.results.length); i++) {
      setMessage(`Checking for credited artists on result ${i + 1}`);

      const nextRelease = await fetchAndWait(
        projectResult.results[i].resource_url,
        settings.searchSpeeds[settings.searchType]
      );
      callCount++;
      if (
        nextRelease.extraartists &&
        nextRelease.extraartists.length >= release.extraartists.length
      ) {
        release = nextRelease;
      }
    }

    // confirm that we have a list of contributors
    if (!release.extraartists || release.extraartists.length === 0) {
      resetSearch("No contributors were listed in any of the records found.");
      return;
    }

    // success! we have a list of contributing artists
    setMessage(
      `Checking releases associated with ${
        release.extraartists.length
      } contributor${release.extraartists.length > 1 && "s"}.`
    );
    updateLoadingStates({
      connect: { isLoading: false, isComplete: true },
      credits: { isLoading: true, isComplete: false },
      records: { isLoading: true, isComplete: false },
    });

    // initialize the output array
    const output = [];

    // form a collection of relevant contributors and their roles
    const contributors = new Map();

    // some artists may be recorded multiple times as a contributor
    // here we are making sure that all roles will be recorded under one entry
    release.extraartists.forEach((extraArtist) => {
      // check if the extra artist has alredy been recorded with roles
      const oldRoles = contributors.has(extraArtist.id)
        ? [...contributors.get(extraArtist.id).roles]
        : [];

      // record only the new roles in this extra artist entry
      const newRoles = extraArtist.role
        .split(",")
        .map((role) => role.replace(/\[[^\]]*\]/g, "").trim())
        .filter((trimmedRole) => !oldRoles.includes(trimmedRole))
        .filter(
          (trimmedRole) =>
            !settings.excludeProduction ||
            !settings.productionRoles.includes(trimmedRole.toLowerCase())
        )
        .filter(
          (trimmedRole) =>
            !settings.excludeCorporate ||
            !settings.corporateRoles.includes(trimmedRole.toLowerCase())
        )
        .filter(
          (trimmedRole) =>
            !settings.excludeOtherMedia ||
            !settings.otherMediaRoles.includes(trimmedRole.toLowerCase())
        );

      // update the contributor if there are new roles
      if (newRoles.length > 0) {
        contributors.set(extraArtist.id, {
          id: extraArtist.id,
          name: extraArtist.name,
          link: extraArtist.resource_url,
          roles: [...oldRoles, ...newRoles],
        });
      }
    });

    const allRoles = new Set();

    // for each contributor
    let contributorInc = 1;
    for (const contributor of [...contributors.values()]) {
      // obey call limits
      if (settings.searchType === "fast" && callCount >= callLimit - 2) {
        setMessage("Too many API calls. Aborting...");
        break;
      }

      setMessage(
        `Checking contributor ${contributorInc} of ${contributors.size}.`
      );

      let contributorResponse;
      // attempt to look up the current contributor
      try {
        contributorResponse = await fetchAndWait(
          contributor.link,
          settings.searchSpeeds[settings.searchType]
        );
        callCount++;
      } catch (error) {
        resetSearch("an error occurred while fetching contributors");
        break;
      }

      // we successfully found our contributor
      setMessage(
        `fetching releases for contributor ${contributorInc} of ${contributors.size}.`
      );

      let contributorReleasesResponse;
      try {
        contributorReleasesResponse = await fetchAndWait(
          `https://api.discogs.com/artists/${contributorResponse.id}/releases?page=1&per_page=100`,
          settings.searchSpeeds[settings.searchType]
        );
        callCount++;
      } catch (error) {
        resetSearch(
          `an error occurred while fetching releases for contributor ${contributorInc}`
        );
        break;
      }

      // Check that the contributor release response is properly formatted
      if (contributorReleasesResponse && contributorReleasesResponse.releases) {
        // Create a new artist with the contributor information and add it to the output

        const newArtist = createArtistRecord(
          contributor.name,
          contributor.id,
          contributorReleasesResponse.releases,
          contributor.roles ?? []
        );

        // save the artist to output and save their roles in the allRoles set
        output.push(newArtist);
        if (contributor.roles && contributor.roles.length > 0) {
          contributor.roles.forEach((role) => {
            allRoles.add(role);
          });
        }
      }

      contributorInc++;
    }

    updateLoadingStates({
      credits: { isLoading: false, isComplete: true },
      records: { isLoading: false, isComplete: true },
    });

    // successfully retrieved all possible contributor information for the record
    // set the list of artists and unique roles
    setArtistData(output);
    setRolesData(
      [...allRoles].map((role) => {
        return { role: role, selected: true };
      })
    );
    if (settings.searchType === "fast") {
      setCooldown(true);
    }
    resetSearch("");
    return;
  };

  const toggleSettingsModal = async () => {
    const isOpen = displaySettings;
    setDisplaySettings(!isOpen);
  };

  const handleSettingsChange = (e) => {
    e.preventDefault();
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const getRoleByName = (roleName, roles) =>
    roles.find((role) => role.role === roleName);

  const hasNoSelectedRole = (artist, roles) => {
    return (
      artist.roles.length > 0 &&
      artist.roles.every((role) => !getRoleByName(role, roles)?.selected)
    );
  };

  const handleSelectArtist = (id) => {
    setArtistData((prevArtists) =>
      prevArtists.map((artist) =>
        artist.id === id
          ? {
              ...artist,
              selected: !artist.selected,
            }
          : artist
      )
    );
  };

  const handleSelectRole = (roleName) => {
    setRolesData((prevRoles) => {
      const updatedRoles = prevRoles.map((role) =>
        role.role === roleName ? { ...role, selected: !role.selected } : role
      );

      setArtistData((prevArtists) => {
        return prevArtists.map((artist) => {
          if (artist.roles.includes(roleName)) {
            return {
              ...artist,
              disabled: hasNoSelectedRole(artist, updatedRoles),
            };
          }
          return artist;
        });
      });

      return updatedRoles;
    });
  };

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

  useEffect(() => {
    setMessage(`displaying ${releasesData.length} records`);
  }, [releasesData]);

  useEffect(() => {
    const displayReleases = new Map();
    const hasSelectedRoles = (artist) =>
      artist.roles.some(
        (role) => rolesData.find((element) => element.role === role)?.selected
      );
    // for each valid artist in the data
    // valid artist must be selected
    // valid artist must have at least one selected role if their roles array is non-empty
    console.log(
      artistData,
      artistData.filter(
        (artist) =>
          artist.selected &&
          (artist.roles.length === 0 || hasSelectedRoles(artist))
      )
    );

    artistData
      .filter(
        (artist) =>
          artist.selected &&
          (artist.roles.length === 0 || hasSelectedRoles(artist))
      )
      .forEach((artist) => {
        // then for each release on each artist
        artist.releases.forEach((release) => {
          // get the release id and record all of its contributors in an array
          const id = release.main_release ? release.main_release : release.id;
          const contributors = [];
          // retrieve the current contributors list as edited by other iterations
          // of artists and releases
          if (displayReleases.has(id)) {
            contributors.push(...displayReleases.get(id).contributors);
          }

          // add the current artist as a contributor to the record,
          // so long as they haven't already been added
          if (
            !contributors.some(
              (contributor) => contributor.name === artist.name
            )
          ) {
            // push only their roles which are selected
            contributors.push({
              name: artist.name,
              roles: artist.roles.filter(
                (artistRole) =>
                  rolesData.find((role) => role.role === artistRole)
                    ?.selected === true
              ),
            });
          }

          // save the album with its contributors to the display realeases map
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

    setReleasesData(
      filteredReleases.sort(
        (a, b) => b.contributors.length - a.contributors.length
      )
    );
  }, [artistData, rolesData, settings]);

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

  console.log(artistData, releasesData, rolesData);

  return (
    <>
      <StyledApp>
        <StyledUpperSeach>
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
          <StyledInputBlock>
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
          </StyledInputBlock>
          <Settings
            settings={settings}
            handleSettingsChange={handleSettingsChange}
            toggleSettingsModal={toggleSettingsModal}
            displaySettings={displaySettings}
          />
        </StyledUpperSeach>
        <StyledLowerSearch>
          <MediaQuery maxWidth={mobileScreenWidth}>
            <StyledSearchCarousel>
              <IconButton onClick={handlePrev} style={IconButtonStyles}>
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
              <IconButton onClick={handleNext} style={IconButtonStyles}>
                <NavigateNext />
              </IconButton>
            </StyledSearchCarousel>
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
        </StyledLowerSearch>
        <CoolDownTimer coolDown={coolDown} />
        <Results
          artists={artistData}
          roles={rolesData}
          numArtists={
            artistData.filter(
              (artist) => artist.selected === true && artist.disabled === false
            ).length
          }
          releasesData={releasesData}
          message={message}
          active={activeSearch !== ""}
          handleSelectArtist={handleSelectArtist}
          handleSelectRole={handleSelectRole}
          settings={settings}
        />
      </StyledApp>
    </>
  );
}

export default App;
