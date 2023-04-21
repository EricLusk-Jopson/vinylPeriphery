const express = require("express");
const searchForRecord = require("../controllers/searchController");

const router = express.Router();
router.route("/search").get(searchForRecord);

module.exports = router;
