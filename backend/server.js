const express = require("express");
const dotenv = require("dotenv");

const port = process.env.PORT || 5000;

// intitalize express
const app = express();

// middleware for handling JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routing for search API
app.use("/api/search", require("./routes/searchRoutes"));

// serve frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "build", "index.html")
    )
  );
} else {
  app.get("/", (req, res) => res.send("Please set to production"));
}

// run the application
app.listen(port, () => console.log(`Server started on port ${port}`));
