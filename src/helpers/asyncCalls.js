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
