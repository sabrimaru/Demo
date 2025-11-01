
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Scheduler from './components/Scheduler';
import { User, Shift, SwapRequest, VacationRequest, ShiftDefinition } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
// Fix: Import QuerySnapshot and DocumentData for explicit typing
import { collection, onSnapshot, doc, setDoc, addDoc, updateDoc, deleteDoc, writeBatch, QuerySnapshot, DocumentData } from 'firebase/firestore';

const App: React.FC = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [shiftDefinitions, setShiftDefinitions] = useState<ShiftDefinition>({
    morning: { start: '08:00', end: '16:00' },
    evening: { start: '16:00', end: '00:00' },
  });
  
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Find the user profile in our 'users' collection
        // Fix: doc() is synchronous and should not be awaited.
        const userDoc = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userDoc, (docSnapshot) => {
            if (docSnapshot.exists()) {
                 // Fix: Spread operator error likely due to incorrect await above. No change needed here after fixing await.
                 setLoggedInUser({ id: docSnapshot.id, ...docSnapshot.data() } as User);
            } else {
                 console.error("User profile not found in Firestore!");
                 setLoggedInUser(null);
            }
        });
        return () => unsubscribeUser();
      } else {
        setLoggedInUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Listen for real-time updates from Firestore
    // Fix: Explicitly type snapshot as QuerySnapshot to fix 'docs' property error.
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot: QuerySnapshot<DocumentData>) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setAllUsers(usersData);
    });
    
    // Fix: Explicitly type snapshot as QuerySnapshot to fix 'docs' property error.
    const unsubShifts = onSnapshot(collection(db, "shifts"), (snapshot: QuerySnapshot<DocumentData>) => {
      const shiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
      setShifts(shiftsData);
    });

    // Fix: Explicitly type snapshot as QuerySnapshot to fix 'docs' property error.
    const unsubVacations = onSnapshot(collection(db, "vacations"), (snapshot: QuerySnapshot<DocumentData>) => {
      const vacationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VacationRequest));
      setVacations(vacationsData);
    });

    // Fix: Explicitly type snapshot as QuerySnapshot to fix 'docs' property error.
    const unsubSwaps = onSnapshot(collection(db, "swapRequests"), (snapshot: QuerySnapshot<DocumentData>) => {
        const swapsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SwapRequest));
        setSwapRequests(swapsData);
    });

    const unsubSettings = onSnapshot(doc(db, "settings", "shiftDefinitions"), (docSnapshot) => {
        if (docSnapshot.exists()) {
            setShiftDefinitions(docSnapshot.data() as ShiftDefinition);
        }
    });

    return () => {
      unsubUsers();
      unsubShifts();
      unsubVacations();
      unsubSwaps();
      unsubSettings();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><div className="text-xl dark:text-white">Cargando...</div></div>;
  }

  const handleLogout = async () => {
    await auth.signOut();
  };
  
  // --- Data Mutation Functions ---
  const handleSetShifts = async (newShifts: Shift[] | ((prevShifts: Shift[]) => Shift[])) => {
    // This function is now more complex. We need to handle individual CRUD operations.
    // Example: add a shift
    const newShift = Array.isArray(newShifts) ? newShifts[newShifts.length - 1] : null; // simplified
    if (newShift && !newShift.id) {
       await addDoc(collection(db, "shifts"), { ...newShift, id: undefined });
    }
  };

  const handleUpdateShift = async (shift: Shift) => {
    const shiftDoc = doc(db, "shifts", shift.id);
    await updateDoc(shiftDoc, shift);
  };
  
  const handleDeleteShift = async (shiftId: string) => {
      await deleteDoc(doc(db, "shifts", shiftId));
  };
  
  const handleAddShift = async (shiftData: Omit<Shift, 'id'>) => {
      await addDoc(collection(db, "shifts"), shiftData);
  }

  const handleSetVacations = async (newVacations: VacationRequest[]) => {
      // In a real scenario, you'd find the new/updated vacation and write it
      // For simplicity, we create individual functions.
  };

  const handleAddVacation = async (vacationData: Omit<VacationRequest, 'id'>) => {
      await addDoc(collection(db, "vacations"), vacationData);
  }
  
  const handleUpdateVacation = async (vacation: VacationRequest) => {
    await updateDoc(doc(db, "vacations", vacation.id), vacation);
  };

  const handleDeleteVacation = async (vacationId: string) => {
      await deleteDoc(doc(db, "vacations", vacationId));
  };

  const handleAddSwapRequest = async (swapData: Omit<SwapRequest, 'id'>) => {
      await addDoc(collection(db, "swapRequests"), swapData);
  }

  const handleApproveSwap = async (swap: SwapRequest, shift1: Shift, shift2: Shift) => {
      const batch = writeBatch(db);
      
      const shift1Ref = doc(db, "shifts", shift1.id);
      batch.update(shift1Ref, { teamMember: shift2.teamMember });

      const shift2Ref = doc(db, "shifts", shift2.id);
      batch.update(shift2Ref, { teamMember: shift1.teamMember });

      const swapRef = doc(db, "swapRequests", swap.id);
      batch.delete(swapRef);

      await batch.commit();
  }

  const handleDeleteSwap = async (swapId: string) => {
      await deleteDoc(doc(db, "swapRequests", swapId));
  }
  
  const handleSetShiftDefinitions = async (definitions: ShiftDefinition) => {
      await setDoc(doc(db, "settings", "shiftDefinitions"), definitions);
  }

  if (!loggedInUser) {
    return <LoginPage />;
  }

  return (
    <Scheduler 
      user={loggedInUser} 
      onLogout={handleLogout} 
      allUsers={allUsers}
      shifts={shifts}
      onAddShift={handleAddShift}
      onUpdateShift={handleUpdateShift}
      onDeleteShift={handleDeleteShift}
      vacations={vacations}
      onAddVacation={handleAddVacation}
      onUpdateVacation={handleUpdateVacation}
      onDeleteVacation={handleDeleteVacation}
      swapRequests={swapRequests}
      onAddSwapRequest={handleAddSwapRequest}
      onApproveSwap={handleApproveSwap}
      onDeleteSwap={handleDeleteSwap}
      shiftDefinitions={shiftDefinitions}
      onSetShiftDefinitions={handleSetShiftDefinitions}
    />
  );
};

export default App;
