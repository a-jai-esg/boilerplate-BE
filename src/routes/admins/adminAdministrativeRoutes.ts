// Administrative routes. Please handle carefully.

import codes from "../../common/constants/http-codes.json";
import * as bodyParser from "body-parser";
import { Router, Request, Response } from "express";

// firebase firestore functions
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  Firestore,
  deleteDoc,
  DocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

// firebase auth functions
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

import * as admin from "firebase-admin";

const adminAdministrativeRouter: Router = Router();
adminAdministrativeRouter.use(bodyParser.json());

import { FirebaseApp, initializeApp } from "firebase/app";
import userAccountInterface from "../../interfaces/accounts/userAccountInterface";

// * PRIVATE, PLEASE HIDE. *
const firebaseConfig: object = {
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

// Initialize Firebase
const adminCollection: string = "admins"; // collection name of admins
const userCollection: string = "users"; // collection name of users
const app: FirebaseApp = initializeApp(firebaseConfig);
const firestoreDatabase: Firestore = getFirestore(app);

// Initialize Admin
admin.initializeApp(
  {
    credential: admin.credential.cert(serviceAccount),
  },
  "administrator"
);

adminAdministrativeRouter
  .route("/")
  .get(async (req: Request, res: Response) => {
    res
      .status(codes["4xx_CLIENT_ERROR"].FORBIDDEN)
      .json({ message: "Sorry :(" });
  });

adminAdministrativeRouter
  .route("/")
  .post(async (req: Request, res: Response) => {
    res
      .status(codes["4xx_CLIENT_ERROR"].BAD_REQUEST)
      .json({ message: "Sorry :(" });
  });

// delete user account
adminAdministrativeRouter
  .route("/delete-user-account")
  .post(async (req: Request, res: Response) => {
    const docRef: any = doc(
      firestoreDatabase,
      adminCollection,
      req.body.emailAddress
    );
    const docSnap = await getDoc(docRef);

    try {
      res.setHeader("Content-Type", "application/JSON");
      if (
        req.body.emailAddress === null ||
        (req.body.emailAddress === "" && req.body.password === null) ||
        req.body.password === ""
      ) {
        res
          .status(codes["4xx_CLIENT_ERROR"].UNAUTHORIZED)
          .send({ message: "Bad request." });
      } else {
        if (docSnap.exists()) {
          const auth = getAuth();
          await signInWithEmailAndPassword(
            auth,
            req.body.emailAddress,
            req.body.password
          )
            .then(async () => {
              // Signed in

              // Fetch user's data
              const userDocRef = doc(
                firestoreDatabase,
                userCollection,
                req.body.userEmailAddress
              );
              const userDocSnap: DocumentSnapshot<DocumentData, DocumentData> =
                await getDoc(userDocRef);

              if (userDocSnap !== null) {
                // Delete the user account
                const userData = userDocSnap.data() as userAccountInterface;
                const adminAuth = admin.auth(admin.app("administrator"));
                await adminAuth.deleteUser(userData.accountId);

                // Log the deletion
                const deletedAccountDocRef = doc(
                  firestoreDatabase,
                  "deleted_accounts",
                  userData.accountId
                );

                await setDoc(deletedAccountDocRef, {
                  ...userData,
                  userType: "user",
                });
                await deleteDoc(userDocRef);

                return res
                  .status(codes["2xx_SUCCESS"].OK)
                  .json({ message: `Account deleted successfully.` });
              } else {
                return res
                  .status(codes["4xx_CLIENT_ERROR"].NOT_FOUND)
                  .json({ message: `Account not found.` });
              }
            })
            .catch(() => {
              res
                .setHeader("Content-Type", "application/JSON")
                .status(codes["5xx_SERVER_ERROR"].GATEWAY_TIMEOUT)
                .send({ message: "Error in user account deletion." });
            });
        } else {
          res
            .status(codes["5xx_SERVER_ERROR"].GATEWAY_TIMEOUT)
            .json({ message: "Error in user account deletion." });
        }
      }
    } catch (Exception) {
      res
        .setHeader("Content-Type", "application/JSON")
        .status(codes["5xx_SERVER_ERROR"].INTERNAL_SERVER_ERROR)
        .send({ message: `${Exception}` });
    }
  });

export default adminAdministrativeRouter;
