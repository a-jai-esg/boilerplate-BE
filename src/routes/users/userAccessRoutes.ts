// This route is used for login and registration only.
import userAccountInterface from "../../interfaces/accounts/userAccountInterface";
import codes from "../../common/constants/http-codes.json";
import * as bodyParser from "body-parser";
import { Router, Request, Response } from "express";

// firebase firestore functions
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  DocumentData,
  DocumentSnapshot,
  Firestore,
} from "firebase/firestore";

// firebase auth functions
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  UserCredential,
  Auth,
} from "firebase/auth";

const userAccessRouter: Router = Router();
userAccessRouter.use(bodyParser.json());

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
const collectionName: string = "users"; // define collection name here
const app: FirebaseApp = initializeApp(firebaseConfig);
const firestoreDatabase: Firestore = getFirestore(app);

userAccessRouter.route("/").get(async (req: Request, res: Response) => {
  res.status(codes["2xx_SUCCESS"].OK).json({ message: "Hello, world!" });
});

userAccessRouter.route("/").post(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
    .json({ message: "Sorry :(" });
});

// login
userAccessRouter.route("/login").post(async (req: Request, res: Response) => {
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
        await signInWithEmailAndPassword(
          auth,
          request.emailAddress,
          request.password
        )
          .then(() => {
            // Signed in
            const userAccessData = docSnap.data() as userAccountInterface;
            res.status(codes["2xx_SUCCESS"].OK).send(userAccessData);
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
      .status(codes["5xx_SERVER_ERROR"].GATEWAY_TIMEOUT)
      .json({ message: `${Exception}` });
  }
});

// register
userAccessRouter
  .route("/register")
  .post(async (req: Request, res: Response) => {
    const request = req.body;
    try {
      res.setHeader("Content-Type", "application/JSON");
      const docRef = doc(
        firestoreDatabase,
        collectionName,
        request.emailAddress
      );
      const docSnap: DocumentSnapshot<DocumentData, DocumentData> =
        await getDoc(docRef);

      // Check if account already exists
      if (docSnap.exists()) {
        return res
          .status(codes["4xx_CLIENT_ERROR"].CONFLICT)
          .json({ message: "Account already exists." });
      }

      const auth: Auth = getAuth();
      try {
        // Create userAccess
        const userAccessCredential: UserCredential =
          await createUserWithEmailAndPassword(
            auth,
            request.emailAddress,
            request.password
          );

        // Retrieve userAccess details
        const userAccess: User = userAccessCredential.user;

        const userAccessObject: userAccountInterface = {
          accountId: userAccess.uid,
          profilePicture: request.profilePicture === null ? null : request.profilePicture,
          emailAddress: request.emailAddress,
          fullName: request.fullName != null ? request.fullName : null,
          pointsBalance: 0.0,
          roles: request.roles === "user" ? "user" : "merchant" 
        };

        // Update userAccess profile
        await updateProfile(userAccess, { displayName: request.fullName });

        // Write to firestore
        await setDoc(docRef, userAccessObject);
        return res.status(codes["2xx_SUCCESS"].OK).json({
          message: `Welcome, Aboard. ${request.fullName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST).json({
          message: "Failure in registration.",
        });
      }
    } catch (Exception) {
      console.log(Exception);
      return res.status(codes["5xx_SERVER_ERROR"].GATEWAY_TIMEOUT).json({
        message: "Failure in registration.",
      });
    }
  });

export default userAccessRouter;
