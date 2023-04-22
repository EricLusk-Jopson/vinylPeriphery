const asyncHandler = require("express-async-handler");

// @desc    get search results from a band and ablum string
// @route   GET /api/search
// @access  Public
const searchForRecord = asyncHandler(async (req, res) => {
  // check for required fields
  if (!req.query.album || !req.query.band) {
    res.status(400);
    throw new Error("Make sure a band name and album name are provided");
  }

  const url = `https://api.discogs.com/database/search?release_title=${req.query.album}&artist=${req.query.band}&type=release&sort=year&sort_order=asc&key=${process.env.CONSUMER_KEY}&secret=${process.env.CONSUMER_SECRET}`;
  const results = await fetch(url).then((response) => response.json());
  res.status(200).json(results);
});

module.exports = searchForRecord;
