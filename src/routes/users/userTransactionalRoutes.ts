// This route is used for login and registration only.
import userAccountInterface from "../../interfaces/accounts/userAccountInterface";
import codes from "../../common/constants/http-codes.json";
import * as bodyParser from "body-parser";
import { Router, Request, Response} from "express";

// firebase firestore functions
import {
  getFirestore,
  doc,
  getDoc,
  Firestore,
  updateDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// firebase auth functions
import { getAuth, signInWithEmailAndPassword, Auth } from "firebase/auth";

const userTransactionalRouter: Router = Router();
userTransactionalRouter.use(bodyParser.json());

import { FirebaseApp, initializeApp } from "firebase/app";
import itemInterface from "../../interfaces/items/itemInterface";

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

userTransactionalRouter.route("/").get(async (req: Request, res: Response) => {
  res.status(codes["2xx_SUCCESS"].OK).json({ message: "Hello, world!" });
});

userTransactionalRouter.route("/").post(async (req: Request, res: Response) => {
  res
    .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
    .json({ message: "Sorry :(" });
});

// ============== FOR MERCHANTS ONLY ================= //

// add basura/items
userTransactionalRouter.route('/add-items').post(async (req: Request, res: Response) => {
  const targetCollectionName: string = "items";
  const { emailAddress, password, itemId, itemName, itemDescription, itemPreviousOwner} = req.body;
  res.setHeader('Content-Type', 'application/JSON');

  if (!emailAddress || !password) {
    return res.status(codes['4xx_CLIENT_ERROR'].BAD_REQUEST).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, collectionName, emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth();
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(codes['4xx_CLIENT_ERROR'].FORBIDDEN).json({ message: 'Access forbidden.' });
    }

    const queriedDocRef = doc(firestoreDatabase, targetCollectionName, itemId);
    const queriedDocSnap = await getDoc(queriedDocRef);

    let itemObject: itemInterface;
    // do not add if it exists
    if (queriedDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'Item found.' });
    }

    // add if it exists
    else{
      itemObject = {
        itemId: itemId,
        itemPreviousOwner: itemPreviousOwner,
        itemName: itemName,
        itemValidity: true, // set true by default
        itemDescription: itemDescription != null ? itemDescription : null
      } 
    }

    await setDoc(queriedDocRef, itemObject);
    return res.status(codes['2xx_SUCCESS'].OK).json({
      message: `Added item: ${itemName}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(codes['5xx_SERVER_ERROR'].GATEWAY_TIMEOUT).json({ message: 'Internal server error.' });
  }
});

// update basura/items validity
userTransactionalRouter.route('/update-item-validity').post(async (req: Request, res: Response) => {
  const targetCollectionName: string = "items";
  const { emailAddress, password, itemId, itemValidity} = req.body;
  res.setHeader('Content-Type', 'application/JSON');

  if (!emailAddress || !password) {
    return res.status(codes['4xx_CLIENT_ERROR'].BAD_REQUEST).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, collectionName, emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth();
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(codes['4xx_CLIENT_ERROR'].FORBIDDEN).json({ message: 'Access forbidden.' });
    }

    const queriedDocRef = doc(firestoreDatabase, targetCollectionName, itemId);
    const queriedDocSnap = await getDoc(queriedDocRef);

    // do not add if it exists
    if (queriedDocSnap.exists()) { 
      await updateDoc(queriedDocRef, {itemValidity : itemValidity});
    }

    // add if it exists
    else{
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });       
    }

    return res.status(codes['2xx_SUCCESS'].OK).json({
      message: `Updated validity of item to ${itemValidity}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(codes['5xx_SERVER_ERROR'].GATEWAY_TIMEOUT).json({ message: 'Internal server error.' });
  }
});


// delete basura/item
userTransactionalRouter.route('/delete-items').post(async (req: Request, res: Response) => {
  const targetCollectionName: string = "items";
  const { emailAddress, password, itemId, itemName} = req.body;
  res.setHeader('Content-Type', 'application/JSON');

  if (!emailAddress || !password) {
    return res.status(codes['4xx_CLIENT_ERROR'].BAD_REQUEST).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, collectionName, emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth();
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(codes['4xx_CLIENT_ERROR'].FORBIDDEN).json({ message: 'Access forbidden.' });
    }

    const queriedDocRef = doc(firestoreDatabase, targetCollectionName, itemId);
    const queriedDocSnap = await getDoc(queriedDocRef);

    // do not add if it exists
    if (!queriedDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }
    // delete if it exists
    else{
      deleteDoc(queriedDocRef); // delete item
    }

    return res.status(codes['2xx_SUCCESS'].OK).json({
      message: `Deleted item: ${itemName}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(codes['5xx_SERVER_ERROR'].GATEWAY_TIMEOUT).json({ message: 'Internal server error.' });
  }
});

// check account balance
userTransactionalRouter.route('/check-account-balance').post(async (req: Request, res: Response) => {
  const { emailAddress, password, queriedEmailAddress } = req.body;
  res.setHeader('Content-Type', 'application/JSON');

  if (!emailAddress || !password) {
    return res.status(codes['4xx_CLIENT_ERROR'].BAD_REQUEST).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, collectionName, emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth();
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(codes['4xx_CLIENT_ERROR'].FORBIDDEN).json({ message: 'Access forbidden.' });
    }

    const queriedDocRef = doc(firestoreDatabase, collectionName, queriedEmailAddress);
    const queriedDocSnap = await getDoc(queriedDocRef);

    if (!queriedDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const data = queriedDocSnap.data() as userAccountInterface;
    return res.status(codes['2xx_SUCCESS'].OK).send({ pointsBalance: data.pointsBalance });

  } catch (error) {
    console.error(error);
    return res.status(codes['5xx_SERVER_ERROR'].GATEWAY_TIMEOUT).json({ message: 'Internal server error.' });
  }
});

// update user's balance
userTransactionalRouter.route('/update-user-account-balance').post(async (req: Request, res: Response) => {
  const { emailAddress, password, queriedEmailAddress, updatedPointsBalance } = req.body;
  res.setHeader('Content-Type', 'application/JSON');

  if (!emailAddress || !password) {
    return res.status(codes['4xx_CLIENT_ERROR'].BAD_REQUEST).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, collectionName, emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth();
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(codes['4xx_CLIENT_ERROR'].FORBIDDEN).json({ message: 'Access forbidden.' });
    }

    const queriedDocRef = doc(firestoreDatabase, collectionName, queriedEmailAddress);
    const queriedDocSnap = await getDoc(queriedDocRef);

    if (!queriedDocSnap.exists()) {
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });
    }

    await updateDoc(queriedDocRef, { pointsBalance: updatedPointsBalance });

    return res.status(codes['2xx_SUCCESS'].OK).json({
      message: `Updated Balance of ${queriedEmailAddress}`,
    });

  } catch (error) {
    console.error(error);
    return res.status(codes['5xx_SERVER_ERROR'].GATEWAY_TIMEOUT).json({ message: 'Internal server error.' });
  }
});

// ============== END FOR MERCHANTS ONLY ================= //
export default userTransactionalRouter;
