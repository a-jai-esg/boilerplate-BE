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

const userMiscRouter: Router = Router();
userMiscRouter.use(bodyParser.json());

import { FirebaseApp, initializeApp } from "firebase/app";
import userAccountInterface from "../../interfaces/accounts/userAccountInterface";

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
const collectionName: string = "users"; // define collection name here
const app: FirebaseApp = initializeApp(firebaseConfig);
const firestoreDatabase: Firestore = getFirestore(app);

userMiscRouter.route("/").get(async (req: Request, res: Response) => {
  res.status(codes["4xx_CLIENT_ERROR"].FORBIDDEN).json({ message: "Sorry :(" });
});

userMiscRouter.route("/").post(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].UNAUTHORIZED)
    .json({ message: "Sorry :(" });
});

// update-name
userMiscRouter
  .route("/update-name")
  .post(async (req: Request, res: Response) => {
    const request = req.body;
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      request.emailAddress
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
            fullName: request.fullName,
          })
            .then(() => {
              res.status(codes["2xx_SUCCESS"].OK).json({
                message: `Updated information for ${request.emailAddress}`,
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

// fetch a user/admin of the system
userMiscRouter
  .route("/search")
  .post(async (req: Request, res: Response) => {
    const request = req.body;
  // queried email for search
  const docRef: DocumentReference<DocumentData, DocumentData> = doc(
    firestoreDatabase,
    collectionName,
    request.queriedEmailAddress
  );

  const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(docRef);
  try {
    res.setHeader("Content-Type", "application/JSON");
    if (
      request.emailAddress === null ||
      (request.emailAddress === "" && request.password === null) ||
      request.password === ""
    ) {
      res
        .status(codes["4xx_CLIENT_ERROR"].UNAUTHORIZED)
        .json({ message: "Bad request." });
    } else {
      if (docSnap.exists()) {
        const auth: Auth = getAuth();
        await signInWithEmailAndPassword(
          auth,
          request.emailAddress,
          request.password
        )
          .then(() => {
            // Signed in
            const data : userAccountInterface = docSnap.data() as userAccountInterface;
            res.status(codes["2xx_SUCCESS"].OK).send(data);
          })
          .catch((error) => {
            console.log(error);
            res
              .setHeader("Content-Type", "application/JSON")
              .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
              .json({ message: "User not found." });
          });
      } else {
        res
          .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
          .json({ message: "User not found." });
      }
    }
  } catch (Exception) {
    res
      .setHeader("Content-Type", "application/JSON")
      .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
      .json({ message: `${Exception}` });
  }
});

// update profile picture
userMiscRouter
  .route("/update-profile-picture")
  .post(async (req: Request, res: Response) => {
    const request = req.body;
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      request.emailAddress
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
            request.emailAddress,
            request.password
          )
            .then(() => {
              updateDoc(docRef, {
                profilePicture: request.profilePictureURL,
              })
                .then(() => {
                  res.status(codes["2xx_SUCCESS"].OK).json({
                    message: `Updated information for ${request.emailAddress}`,
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
            .json({ message: "Failure in updating user information." });
        }
      }
    } catch (Exception) {
      console.log(Exception);
      res
        .setHeader("Content-Type", "application/JSON")
        .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
        .json({ message: "Failure in updating user information." });
    }
  });

// change password
userMiscRouter
  .route("/change-password")
  .post(async (req: Request, res: Response) => {
    const request = req.body;
    const docRef: any = doc(
      firestoreDatabase,
      collectionName,
      request.emailAddress
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
          .json({ message: "Account is non-existent." });
      }

      // execute if trap is met.
      else {
        if (docSnap.exists()) {
          const auth: Auth = getAuth();
          await signInWithEmailAndPassword(
            auth,
            request.emailAddress,
            request.password
          )
            .then((data) => {
              updatePassword(data.user, request.newPassword);
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
userMiscRouter.route("/logout").post(async (req: Request, res: Response) => {
  const request = req.body;
  const docRef: any = doc(
    firestoreDatabase,
    collectionName,
    request.emailAddress
  );
  const docSnap: DocumentSnapshot<unknown, DocumentData> = await getDoc(docRef);

  try {
    res.setHeader("Content-Type", "application/JSON");
    if (
      request.emailAddress === null ||
      (request.emailAddress === "" && request.password === null) ||
      request.password === ""
    ) {
      res
        .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
        .json({ message: "Bad request." });
    } else {
      if (docSnap.exists()) {
        const auth: Auth = getAuth();
        signInWithEmailAndPassword(
          auth,
          request.emailAddress,
          request.password
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
          .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
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

export default userMiscRouter;
