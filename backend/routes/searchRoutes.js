const express = require("express");
const searchForRecord = require("../controllers/searchController");

const router = express.Router();
router.route("/").get(searchForRecord);

module.exports = router;
