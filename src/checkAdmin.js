import { db } from "./firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function checkAdmin(mobile) {

  const q = query(collection(db, "admins"), where("mobile", "==", mobile));

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return true;
  } else {
    return false;
  }

}