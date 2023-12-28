/*import { doc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.js";

export const handleDelete = async () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    // Handle the case when the user is not authenticated
    console.error("User not authenticated");
    return;
  }

  const taskDocRef = doc(db, 'users', currentUser.uid);

  try {
    await deleteDoc(taskDocRef);
    // Delete successful, you can add additional logic here if needed
  } catch (err) {
    console.error("Error deleting document:", err);
    // Handle the error (e.g., show an alert)
    alert("Error deleting document");
  }
};*/
