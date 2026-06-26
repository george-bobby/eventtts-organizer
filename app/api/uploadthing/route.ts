// app/api/uploadthing/route.ts

import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Export routes for Next App Router
let token = process.env.UPLOADTHING_TOKEN;
if (!token && process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) {
  const tokenObj = {
    apiKey: process.env.UPLOADTHING_SECRET,
    appId: process.env.UPLOADTHING_APP_ID,
    regions: ["sea1"],
  };
  token = Buffer.from(JSON.stringify(tokenObj)).toString("base64");
}

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token,
  },
});
