/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable max-len */
//const functions = require("firebase-functions");
// import from a specific subpackage
const { onRequest } = require("firebase-functions/v2/https");
const next = require("next");
//const http = require('http');
// import path = require("path");

const isDev = process.env.NODE_ENV !== "production";

const server = next({
  dev: isDev,
  // location of .next generated after running -> yarn build
  conf: { distDir: ".next" },
});

const nextjsHandle = server.getRequestHandler();

// functions.runWith({
//   // Keep 1 instances warm for this latency-critical function
//   minInstances: 1,
// }).https.onRequest(

exports.nextjs = onRequest(
  {
    minInstances: 1,
    memory: "2GiB",
    concurency: 1000,
  },
  (req, res) => {
    // https://firebase.google.com/docs/hosting/manage-cache
    res.set("Cache-Control", "public, max-age=3000, s-maxage=6000");
    return server.prepare().then(() => nextjsHandle(req, res));
  }
);

exports.nextjseurope = onRequest(
  {
    minInstances: 1,
    memory: "2GiB",
    concurency: 1000,
    region: "europe-west1",
  },
  (req, res) => {
    // https://firebase.google.com/docs/hosting/manage-cache
    res.set("Cache-Control", "public, max-age=3000, s-maxage=6000");
    return server.prepare().then(() => nextjsHandle(req, res));
  }
);
