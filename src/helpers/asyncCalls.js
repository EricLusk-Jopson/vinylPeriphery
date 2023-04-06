import { callLimit, quickDelay, longDelay } from "./magicNumbers";

export const createArtistRecord = (name, id, pagination, releases, roles) => {
  return {
    name: name,
    id: id,
    pagination: pagination,
    releases: releases,
    roles: roles,
  };
};

export const getSearchResult = async (band, album) => {
  return await fetch(
    `https://api.discogs.com/database/search?release_title=${album}&artist=${band}&type=release&sort=year&sort_order=asc&key=owJjvljKmrcdSbXFVPTu&secret=wgJurrmQFbROAyrmByuLrZMRMhDznPaK`
  ).then((res) => res.json());
};

export const getMembers = async (release, fastSearch, callCount) => {
  const delay = fastSearch ? quickDelay : longDelay;
  let currentCount = callCount;
  const output = [];

  // for every artist recorded in the response
  for (const artist of release.artists) {
    if (fastSearch && currentCount >= callLimit) break;
    console.log(`searching for artist ${artist.name}...`);

    try {
      // fetch their information and count++
      const artistResponse = await fetch(artist.resource_url).then((res) =>
        res.json()
      );
      currentCount++;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // determine if they have members
      if (artistResponse.hasOwnProperty("members")) {
        // for each member in the band
        for (const member of artistResponse.members) {
          if (fastSearch && currentCount >= callLimit - 2) break;

          try {
            // fetch their information and count++
            const memberResponse = await fetch(member.resource_url).then(
              (res) => res.json()
            );
            currentCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));

            // fetch their releases and count++
            const memberReleasesResponse = await fetch(
              `https://api.discogs.com/artists/${memberResponse.id}/releases?page=1&per_page=100`
            ).then((res) => res.json());
            currentCount++;
            await new Promise((resolve) => setTimeout(resolve, delay));

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
            console.error(`Error fetching ${member.resource_url}: ${error}`);
          }
        }
      } else {
        // The artist has no members, so we must add the artist
        console.log(`${artist.name} has NO members`);

        // fetch their releases and count++
        const artistReleasesResponse = await fetch(
          `https://api.discogs.com/artists/${artistResponse.id}/releases?page=1&per_page=100`
        ).then((res) => res.json());
        currentCount++;
        await new Promise((resolve) => setTimeout(resolve, delay));

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
  return output;
};

export const getContributors = async (release, fastSearch, callCount) => {
  const delay = fastSearch ? quickDelay : longDelay;
  let currentCount = callCount;
  const output = [];

  console.log(release);
  console.log(release.extraartists);

  if (!release.extraartists && release.extraartists.length === 0) {
    alert("couldn't locate a list of credited artists for this album :(");
    return [];
  }
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
    if (fastSearch && currentCount >= callLimit - 2) break;
    try {
      // fetch their information
      const contributorResponse = await fetch(contributor.link).then((res) =>
        res.json()
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
      await new Promise((resolve) => setTimeout(resolve, delay));

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

  return output;
};

export const loadMore = async (data, relation, fastSearch) => {
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
      if (fastSearch && currentCount >= callLimit - 1) break;
      const artistReleases = await fetch(artist.pagination[relation])
        .then((res) => res.json())
        .catch((err) => console.log(err));
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
  return output;
};
