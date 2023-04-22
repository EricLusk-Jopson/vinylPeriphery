const asyncHandler = require("express-async-handler");

// @desc    get search results from a band and ablum string
// @route   GET /api/search
// @access  Public
const searchForRecord = asyncHandler(async (req, res) => {
  // check for required fields
  if (!req.body.album || !req.body.band) {
    res.status(400);
    throw new Error("Make sure a band name and album name are provided");
  }

  const url = `https://api.discogs.com/database/search?release_title=${req.body.album}&artist=${req.body.band}&type=release&sort=year&sort_order=asc&key=${process.env.CONSUMER_KEY}&secret=${process.env.CONSUMER_SECRET}`;
  const results = await fetch(url).then((response) => response.json());
  res.status(200).json(results);
});

module.exports = searchForRecord;
