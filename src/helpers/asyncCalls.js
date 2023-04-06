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
