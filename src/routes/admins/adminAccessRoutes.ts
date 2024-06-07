// This route is used for login and registration only.
import adminAccountInterface from "../../interfaces/accounts/adminAccountInterface";
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
  //   updateProfile,
} from "firebase/auth";

const adminAccessRouter: Router = Router();
adminAccessRouter.use(bodyParser.json());

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

adminAccessRouter.route("/").get(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
    .json({ message: "Sorry :(" });
});

adminAccessRouter.route("/").post(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
    .json({ message: "Sorry :(" });
});

// login
adminAccessRouter.route("/login").post(async (req: Request, res: Response) => {
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
            const adminAccessData = docSnap.data() as adminAccountInterface;
            res.status(codes["2xx_SUCCESS"].OK).send(adminAccessData);
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

// register
adminAccessRouter
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
          .status(codes["4xx_CLIENT_ERROR"].FORBIDDEN)
          .json({ message: "Account already exists." });
      }

      const auth = getAuth();
      try {
        // Create adminAccess
        const adminAccessCredential: UserCredential =
          await createUserWithEmailAndPassword(
            auth,
            request.emailAddress,
            request.password
          );

        // Retrieve adminAccess details
        const adminAccess: User = adminAccessCredential.user;

        const adminAccessObject: adminAccountInterface = {
          accountId: adminAccess.uid,
          profilePicture: null,
          emailAddress: request.emailAddress,
          fullName: request.fullName != null ? request.fullName : null,
        };

        // Update adminAccess profile
        await updateProfile(adminAccess, { displayName: request.fullName });

        // Write to firestore
        await setDoc(docRef, adminAccessObject);
        return res.status(codes["2xx_SUCCESS"].OK).json({
          message: `Welcome, Aboard, Admin. ${request.fullName}`,
        });
      } catch (error) {
        console.log(error);
        return res.status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST).json({
          message: "Failure in registration.",
        });
      }
    } catch (Exception) {
      console.log(Exception);
      return res.status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST).json({
        message: "Failure in registration.",
      });
    }
  });

export default adminAccessRouter;
