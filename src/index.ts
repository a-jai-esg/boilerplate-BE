import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";

// firebase
import * as functions from "firebase-functions";

// routes
import userAccessRouter from "./routes/users/userAccessRoutes";
import userMiscRouter from "./routes/users/userMiscRoutes";
import adminAccessRouter from "./routes/admins/adminAccessRoutes";
import adminAdministrativeRouter from "./routes/admins/adminAdministrativeRoutes";
import adminMiscRouter from "./routes/admins/adminMiscRoutes";
import userTransactionalRouter from "./routes/users/userTransactionalRoutes";

// define express middleware
const PORT: number = 5174; // define port number
const expressApplication: express.Application = express(); // make an instanceof express application

// cross-origin resource sharing certifications
expressApplication.use(cors({ origin: true }));
expressApplication.use(express.urlencoded({ extended: true }));
expressApplication.use(express.json());
expressApplication.use(bodyParser.json());

// define routes
expressApplication.use("/", userAccessRouter); // use the default "slash" endpoint for the users' access only
expressApplication.use("/users", userMiscRouter); // use this for user's interaction and transaction to the system.
expressApplication.use("/users/transactional", userTransactionalRouter) // use this for user's transaction

expressApplication.use("/admin", adminAccessRouter); // use for admin access only
expressApplication.use("/admin/miscellaneous", adminMiscRouter); // same as with /users endpoint but for admins
expressApplication.use("/admin/administrative", adminAdministrativeRouter); // used only for administrative functions as it contains dangerous functions.

// default listener
expressApplication.listen(PORT, () => {
  try {
    console.log(`Backend running on port ${PORT}`);
  } catch (Exception) {
    console.error(`An exception has occurred: ${Exception}`);
  }
});

// for firebase cloud-functions:
export const api = functions.https.onRequest(expressApplication);
