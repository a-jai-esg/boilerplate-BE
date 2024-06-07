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
  collection,
  getDocs,
} from "firebase/firestore";

// firebase auth functions
import { getAuth, signInWithEmailAndPassword, Auth } from "firebase/auth";

import * as admin from "firebase-admin";

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

const serviceAccount: object = {
  type: "service_account",
  project_id: "cibo-hackathon-2024",
  private_key_id: "6e91d966b81fc4d7fc63e05c88ec68ca75415541",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKsQwIfUd/+FxR\n4oLz34WacpdIbBDi4+ufS0t61EOFvJLe3MEQ3ZpmE/deMN/z16VqRS9lJS2XC8+I\nONPiBrW+9HDpx0oirYEBeC3UfYUTmMC1qAUkQuHdAGMVC4t6jAwdnlJi4w3iwX/h\nrQyrin84nSBdGANq/Xia6HM49QOT6DzkUKewQpB7FYMjYQ0cm8vJuW5FUnXpLZ0O\ngWh9eyOuuwRNmPShUNPqDlQuOrpY2rD4ENAnMtgfsL/cChHWgieKozjCm9WZTlLd\n4T7CT8FzmcTxELXPesBSLx+gWtmGjbAupOYuWHPXTdX/4WMigDJznqiEnAzIDHCQ\nm6p/RjlPAgMBAAECggEAMtNBarGLZ8Xt1GShpKhkdo2MbM8YTuSLFVcKlsK6KcNW\n6sZdLS78Q+N20GoeBiWJZ4PwtgKkE2+VOxnQ26kGEtt1otFjwB1Ur3skttdAsuDH\nVeXLYEPbIhEyRzktYO3ULesgyoYX2cfemsbLWgpxC0+vKVjXppDnmKR4HAyoOIJ9\nPoiIxNhtN3tDGKS/lhKl7sLQE/ZECqa3rw9x5XCNnoTHNUPGAgRw/uxxOvJcOFgJ\nn4zH/XkybIU04IlO37vzgWjWmwzq5nRuOVh2SVPl7B4PVIl6FEdJK3aRL/b/Vmjt\n5ACMNAd9IAqiWrZQOcivqdjEljcuLflumDoazKs+aQKBgQD9GJsof5evn4f1dEwN\nF4pJxevHNlKtnf/QilKKIJKmqzvbWydUsGlKSgjx6CG7v/iqiL6OOYiqlOppEhah\nikznsdIsdzgsYQzpklc+Z4LwpNJzcGmgeUzoETm4NEd98HdWeAMPXPjQWqFEVQZz\nPXw7nCTKX5V7jJxDoVn9uPNedwKBgQDNBGSKmFPr3Wg0Qp+B+UWxoVbTm3HIG6eF\nCFwfiPad2c/PqVQ/kkbtyxZSjrJ7N64sq2YsXVMRU7pkcGvxdCUPaNZIL4MhFBAU\nu9ZmvHSME9/yqZ4rw8+XXCdsIk2tRUfIR2QfuqxtelNZFzpyRcl4Szie4Abda+RA\n4THA+5l56QKBgQDPaPnGH4HkJ51Yljy4weDPAkZtU+Q/aWq5sJFhpr3nng4IflPm\nAEfY3IEmFTCH1xNmVXerwBRyjmTnRC6NpXPOsBfn3q+HFuVpCEc82cEhikD431eA\nbceLqoodnaI03/o8P09qqKsyvALKp88IY4vKofQ4cEplHF72wWSpG4c9kwKBgBRb\n11AcCFlnxy1JYGWbx1v4VZL14LqqZFxFlEBdbYAHXSeV/RPDBuAeRr00Bm1N/jHZ\nY3AMZG9YDS5kK5PyoKuDEaRhc3gZce9dJ9FT7Y7relWymk5mR3sUX6XRUj1en943\nmK2979l/SD+Umu02GOelMJ42SPg7+pKmyjYLxhXhAoGBAIz2sI2ZonYtgWgvv+zc\nUISwwnLQZ7AyP+PNfUunTODMmnnDBKN/jwsmSmzvO4HmqDrATp6oSPnmMupw7/sW\nd3sHU97iVypl8h+3tDy5xQ5ksIeqOjQoP//acZd9gY/1PXRbpJjEQ8+mMrGUKstb\nuij1coihVoi8hBmvEDIV4T2k\n-----END PRIVATE KEY-----\n",
  client_email:
    "firebase-adminsdk-6tte1@cibo-hackathon-2024.iam.gserviceaccount.com",
  client_id: "110087459146056566824",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-6tte1%40cibo-hackathon-2024.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};
// *************************

// Initialize Admin
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "merchant"
);


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

    // break
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

// retrieve all items
userTransactionalRouter.route('/retrieve-all-items').post(async (req: Request, res: Response) => {
  const { emailAddress, password } = req.body;

  if (!emailAddress || !password) {
    return res.status(400).json({ message: 'Bad request.' });
  }

  try {
    const userDocRef = doc(firestoreDatabase, 'users', emailAddress);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const auth: Auth = getAuth(); // Get authentication instance
    await signInWithEmailAndPassword(auth, emailAddress, password);

    const userTransactionalData = userDocSnap.data() as userAccountInterface;

    if (userTransactionalData.roles !== 'merchant') {
      return res.status(403).json({ message: 'Access forbidden.' });
    }

    const itemsCollectionRef = collection(firestoreDatabase, 'items');
    const querySnapshot = await getDocs(itemsCollectionRef);
    const documents: itemInterface[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const item: itemInterface = {
        itemId: data.itemId, // Assuming doc.id is already a number
        itemName: data.itemName,
        itemValidity: data.itemValidity,
        itemPreviousOwner: data.itemPreviousOwner,
        itemDescription: data.itemDescription || null
      };
      
      documents.push(item);
    });

    return res.status(200).json(documents);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error getting documents' });
  }
});

// Retrieve all valid items from the 'items' collection
userTransactionalRouter.route('/retrieve-all-valid-items').post(async (req: Request, res: Response) => {
  const db = admin.firestore();
  const targetCollectionName: string = "items";

  try {
    const snapshot = await db.collection(targetCollectionName).get();
    const documents: itemInterface[] = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          itemId: data.itemId, // Assuming doc.id can be converted to a number
          itemName: data.itemName,
          itemValidity: data.itemValidity,
          itemPreviousOwner: data.itemPreviousOwner,
          itemDescription: data.itemDescription || null
        };
      })
      .filter(item => item.itemValidity === true);

    res.status(200).json(documents);
  } catch (error) {
    console.error('Error getting documents: ', error);
    res.status(500).json({ error: 'Error getting documents' });
  }
});

// update basura/items validity
userTransactionalRouter.route('/update-item-validity').post(async (req: Request, res: Response) => {
  const targetCollectionName: string = "items";
  const { emailAddress, password, itemId, validity} = req.body;
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
      await updateDoc(queriedDocRef, {itemValidity : validity});
    }

    // add if it exists
    else{
      return res.status(codes['4xx_CLIENT_ERROR'].NOT_FOUND).json({ message: 'User not found.' });       
    }

    return res.status(codes['2xx_SUCCESS'].OK).json({
      message: `Updated validity of item to ${validity}`,
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
