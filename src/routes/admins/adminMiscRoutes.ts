// This route is used for other activities aside from registration and login.
import codes from "../../common/constants/http-codes.json";
import * as bodyParser from "body-parser";
import { Router, Request, Response } from "express";
// firebase firestore functions
import {
  getFirestore,
  doc,
  getDoc,
  DocumentData,
  DocumentSnapshot,
  Firestore,
  updateDoc,
  DocumentReference,
} from "firebase/firestore";

// firebase auth functions
import {
  getAuth,
  signInWithEmailAndPassword,
  Auth,
  updatePassword,
  signOut,
} from "firebase/auth";

const adminMiscRouter: Router = Router();
adminMiscRouter.use(bodyParser.json());

import { FirebaseApp, initializeApp } from "firebase/app";

// * PRIVATE, PLEASE HIDE. *
const firebaseConfig = {
  apiKey: "AIzaSyBHwhsfk2Az6YhPStUN6Aud6e3P7wQ43tw",
  authDomain: "cibo-hackathon-2024.firebaseapp.com",
  projectId: "cibo-hackathon-2024",
  storageBucket: "cibo-hackathon-2024.appspot.com",
  messagingSenderId: "932061823930",
  appId: "1:932061823930:web:b663346d54cbd444f05383",
  measurementId: "G-4KVQNSD2M2",
};
// *************************

// Initialize Firebase
const collectionName: string = "admins"; // define collection name here
const app: FirebaseApp = initializeApp(firebaseConfig);
const firestoreDatabase: Firestore = getFirestore(app);

adminMiscRouter.route("/").get(async (req: Request, res: Response) => {
  res.status(codes["4xx_CLIENT_ERROR"].FORBIDDEN).json({ message: "Sorry :(" });
});

adminMiscRouter.route("/").post(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].UNAUTHORIZED)
    .json({ message: "Sorry :(" });
});

// update-name
adminMiscRouter
  .route("/update-name")
  .post(async (req: Request, res: Response) => {
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      req.body.emailAddress
    );
    const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(
      docRef
    );

    try {
      res.setHeader("Content-Type", "application/JSON");

      // trap statement to see if account is existent
      if (!docSnap.exists()) {
        res
          .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
          .json({ message: "User not found." });
      }

      // execute if trap is met.
      else {
        try {
          await updateDoc(docRef, {
            fullName: req.body.fullName,
          })
            .then(() => {
              res.status(codes["2xx_SUCCESS"].OK).json({
                message: `Updated information for ${req.body.emailAddress}`,
              });
            })
            .catch((e) => {
              console.log(e);
              res
                .setHeader("Content-Type", "application/JSON")
                .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
                .json({ message: "Failure in updating information." });
            });
        } catch (e) {
          console.log(e);
          res
            .setHeader("Content-Type", "application/JSON")
            .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
            .json({ message: "Failure in updating information." });
        }
      }
    } catch (Exception) {
      console.log(Exception);
      res
        .setHeader("Content-Type", "application/JSON")
        .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
        .json({ message: "Failure in updating information." });
    }
  });

// update profile picture
adminMiscRouter
  .route("/update-profile-picture")
  .post(async (req: Request, res: Response) => {
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      req.body.emailAddress
    );

    const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(
      docRef
    );

    try {
      res.setHeader("Content-Type", "application/JSON");

      // trap statement to see if account is existent
      if (!docSnap.exists()) {
        res
          .status(codes["4xx_CLIENT_ERROR"].FORBIDDEN)
          .json({ message: "Bad update request." });
      }

      // execute if trap is met.
      else {
        try {
          const auth: Auth = getAuth();
          await signInWithEmailAndPassword(
            auth,
            req.body.emailAddress,
            req.body.password
          )
            .then(() => {
              updateDoc(docRef, {
                profilePicture: req.body.profilePictureURL,
              })
                .then(() => {
                  res.status(codes["2xx_SUCCESS"].OK).json({
                    message: `Updated information for ${req.body.emailAddress}`,
                  });
                })
                .catch((e) => {
                  console.log(e);
                  res
                    .setHeader("Content-Type", "application/JSON")
                    .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
                    .json({ message: "Failure in updating information." });
                });
            })
            .catch((error) => {
              console.log(error);
              res
                .setHeader("Content-Type", "application/JSON")
                .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
                .json({ message: "User not found." });
            });
        } catch (e) {
          console.log(e);
          res
            .setHeader("Content-Type", "application/JSON")
            .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
            .json({ message: "Failure in updating admin information." });
        }
      }
    } catch (Exception) {
      console.log(Exception);
      res
        .setHeader("Content-Type", "application/JSON")
        .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
        .json({ message: "Failure in updating admin information." });
    }
  });

// change password
adminMiscRouter
  .route("/change-password")
  .post(async (req: Request, res: Response) => {
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      req.body.emailAddress
    );
    const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(
      docRef
    );

    try {
      res.setHeader("Content-Type", "application/JSON");

      // trap statement to see if account is existent
      if (!docSnap.exists()) {
        res
          .status(codes["4xx_CLIENT_ERROR"].FORBIDDEN)
          .json({ message: "Sorry :(." });
      }

      // execute if trap is met.
      else {
        if (docSnap.exists()) {
          const auth: Auth = getAuth();
          await signInWithEmailAndPassword(
            auth,
            req.body.emailAddress,
            req.body.password
          )
            .then((data) => {
              updatePassword(data.user, req.body.newPassword);
              res
                .setHeader("Content-Type", "application/JSON")
                .status(codes["2xx_SUCCESS"].OK)
                .json({ message: "Successfully changed password!" });
            })
            .catch(() => {
              res
                .setHeader("Content-Type", "application/JSON")
                .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
                .json({ message: "Failed to change password." });
            });
        }
      }
    } catch (Exception) {
      console.log(Exception);
      res
        .setHeader("Content-Type", "application/JSON")
        .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
        .json({ message: "Failed to change password." });
    }
  });

// sign-out/logout
adminMiscRouter.route("/logout").post(async (req: Request, res: Response) => {
  const docRef: DocumentReference<DocumentData, DocumentData> = doc(
    firestoreDatabase,
    collectionName,
    req.body.emailAddress
  );
  const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(docRef);

  try {
    res.setHeader("Content-Type", "application/JSON");
    if (
      req.body.emailAddress === null ||
      (req.body.emailAddress === "" && req.body.password === null) ||
      req.body.password === ""
    ) {
      res
        .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
        .json({ message: "Bad request." });
    } else {
      if (docSnap.exists()) {
        const auth: Auth = getAuth();
        signInWithEmailAndPassword(
          auth,
          req.body.emailAddress,
          req.body.password
        )
          .then(() => {
            signOut(auth);
            res
              .setHeader("Content-Type", "application/JSON")
              .status(codes["2xx_SUCCESS"].OK)
              .json({ message: "Goodbye." });
          })
          .catch((e) => {
            console.log(e);
            res
              .setHeader("Content-Type", "application/JSON")
              .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
              .json({ message: "Error in logout." });
          });
      } else {
        res
          .setHeader("Content-Type", "application/JSON")
          .status(codes["5xx_SERVER_ERROR"].GATEWAY_TIMEOUT)
          .json({ message: "Error in logout." });
      }
    }
  } catch (Exception) {
    console.log(Exception);
    res
      .setHeader("Content-Type", "application/JSON")
      .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
      .json({ message: "Error in logout." });
  }
});

export default adminMiscRouter;
