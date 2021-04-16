import express from "express";
import { writeFileSync } from "fs";

import { basicAuth } from "./auth.js";

const PORT = process.env.NODE_ENV === "production" ? 80 : 7777;

const app = express();

const customBodyAuth = basicAuth({
  users: { admin: "derp" },
  challenge: true,
  unauthorizedResponse: getUnauthorizedResponse,
});

// Parse URL-encoded bodies
app.use(express.urlencoded());
// Parse JSON bodies
app.use(express.json());

app.use("/public", express.static("public"));

app.use("/assets", customBodyAuth, express.static("ui/assets"));
app.get("/", customBodyAuth, express.static("ui"));
app.post("/update", customBodyAuth, function (req, res) {
  const { day, date, video } = req.body;
  const updateObject = {
    day,
    date,
    video,
  };
  writeFileSync("./public/tcf-data.json", JSON.stringify(updateObject));
  res.status(200).send("Site updated");
});

app.listen(PORT, function () {
  console.log("Listening!");
});

function getUnauthorizedResponse(req) {
  return req.auth
    ? "Credentials " + req.auth.user + ":" + req.auth.password + " rejected"
    : "No credentials provided";
}
