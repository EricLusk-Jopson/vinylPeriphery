import axios from "axios";

export const createArtistRecord = (name, id, pages, releases, roles) => {
  return {
    name: name,
    id: id,
    pages: pages,
    releases: releases,
    roles: roles,
  };
};

export const getSearchResult = async (band, album) => {
  const searchResult = await axios.get("http://localhost:5000/api/search", {
    params: { band: band, album: album },
  });
  return searchResult.data;
};

export const fetchAndWait = async (url, delay) => {
  const result = await fetch(url).then((res) => res.json());
  await new Promise((resolve) => setTimeout(resolve, delay));
  return result;
};
