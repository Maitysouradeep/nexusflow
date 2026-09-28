import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";
import { logActivity } from "../utils/activityLogger";

const AuthContext = createContext(null);

// --------------------------------------------------
// Hook
// --------------------------------------------------

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

// --------------------------------------------------
// Auth Provider
// --------------------------------------------------

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRegisteringRef = useRef(false);
  // ------------------------------------------------
  // Create workspace
  // ------------------------------------------------

  const createWorkspace = async (firebaseUser) => {
    const workspaceRef = doc(db, "workspaces", firebaseUser.uid);

    await setDoc(workspaceRef, {
      id: firebaseUser.uid,
      name: `${firebaseUser.displayName?.split(" ")[0] || "My"} Workspace`,
      ownerId: firebaseUser.uid,
      ownerEmail: firebaseUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return firebaseUser.uid;
  };

  // ------------------------------------------------
  // Ensure workspace exists
  // ------------------------------------------------

  const ensureWorkspace = async (firebaseUser, existingUserData = null) => {
    // Existing workspace
    if (existingUserData?.workspaceId) {
      setWorkspaceId(existingUserData.workspaceId);

      return existingUserData.workspaceId;
    }

    // First-time workspace
    const newWorkspaceId = await createWorkspace(firebaseUser);

    const userRef = doc(db, "users", firebaseUser.uid);

    await updateDoc(userRef, {
      workspaceId: newWorkspaceId,
      updatedAt: serverTimestamp(),
    });

    setWorkspaceId(newWorkspaceId);

    return newWorkspaceId;
  };

  // ------------------------------------------------
  // Register
  // ------------------------------------------------
  const register = async (email, password, firstName, lastName) => {
    isRegisteringRef.current = true;

    let createdUser = null;
    let createdWorkspaceId = null;

    try {
      // 1. Create Firebase Authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      createdUser = userCredential.user;

      // 2. Set display name
      await updateProfile(createdUser, {
        displayName: `${firstName.trim()} ${lastName.trim()}`,
      });

      // 3. Create workspace
      createdWorkspaceId = await createWorkspace(createdUser);

      // 4. Create user profile
      await setDoc(doc(db, "users", createdUser.uid), {
        uid: createdUser.uid,
        email: createdUser.email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),

        // New users are workspace owners
        role: "owner",

        workspaceId: createdWorkspaceId,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 5. Log registration
      try {
        await logActivity(createdUser.uid, "user_created", {
          email: createdUser.email,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          workspaceId: createdWorkspaceId,
        });
      } catch (activityError) {
        console.error("Activity logging failed:", activityError);
      }

      // 6. Update local state
      setUser(createdUser);
      setUserRole("owner");
      setWorkspaceId(createdWorkspaceId);

      return createdUser;
    } catch (error) {
      console.error("Registration error:", error);

      // Clean up workspace if it was created
      if (createdWorkspaceId) {
        try {
          await deleteDoc(doc(db, "workspaces", createdWorkspaceId));
        } catch (cleanupError) {
          console.error("Workspace cleanup failed:", cleanupError);
        }
      }

      // Clean up Auth account
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (cleanupError) {
          console.error("Failed to clean up incomplete account:", cleanupError);
        }
      }

      throw error;
    } finally {
      isRegisteringRef.current = false;
    }
  };

  // ------------------------------------------------
  // Login
  // ------------------------------------------------

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const loggedInUser = userCredential.user;

      setUser(loggedInUser);

      // Fetch Firestore profile
      const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        const role = userData.role || "user";

        setUserRole(role);

        // Create workspace automatically
        // for older accounts that don't have one.
        await ensureWorkspace(loggedInUser, userData);
      } else {
        // Very unusual case:
        // create a basic profile + workspace.
        const newWorkspaceId = await createWorkspace(loggedInUser);

        await setDoc(doc(db, "users", loggedInUser.uid), {
          uid: loggedInUser.uid,
          email: loggedInUser.email,
          firstName: loggedInUser.displayName?.split(" ")[0] || "",
          lastName:
            loggedInUser.displayName?.split(" ").slice(1).join(" ") || "",
          role: "owner",
          workspaceId: newWorkspaceId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        setUserRole("owner");
        setWorkspaceId(newWorkspaceId);
      }

      // Log login activity
      try {
        await logActivity(loggedInUser.uid, "login", {
          email: loggedInUser.email,
          loginTime: new Date().toISOString(),
        });
      } catch (activityError) {
        console.error("Login activity logging failed:", activityError);
      }

      return loggedInUser;
    } catch (error) {
      console.error("Login error:", error);

      throw error;
    }
  };

  // ------------------------------------------------
  // Logout
  // ------------------------------------------------

  const logout = async () => {
    try {
      if (user) {
        try {
          await logActivity(user.uid, "logout", {
            email: user.email,
            logoutTime: new Date().toISOString(),
          });
        } catch (activityError) {
          console.error("Logout activity logging failed:", activityError);
        }
      }

      await signOut(auth);

      setUser(null);
      setUserRole(null);
      setWorkspaceId(null);
    } catch (error) {
      console.error("Logout error:", error);

      throw error;
    }
  };

  // ------------------------------------------------
  // Fetch User Profile
  // ------------------------------------------------

  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));

      if (!userDoc.exists()) {
        setUserRole("user");
        setWorkspaceId(null);

        return {
          role: "user",
          workspaceId: null,
        };
      }

      const userData = userDoc.data();

      const role = userData.role || "user";

      setUserRole(role);

      setWorkspaceId(userData.workspaceId || null);

      return {
        role,
        workspaceId: userData.workspaceId || null,
        userData,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);

      setUserRole("user");
      setWorkspaceId(null);

      return {
        role: "user",
        workspaceId: null,
      };
    }
  };

  // ------------------------------------------------
  // Firebase Auth State Listener
  // ------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (isRegisteringRef.current) {
          return;
        }
        if (currentUser) {
          setUser(currentUser);

          const profile = await fetchUserProfile(currentUser.uid);

          // Existing accounts created before
          // workspace support need one.
          if (!profile.workspaceId) {
            await ensureWorkspace(currentUser, profile.userData);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setWorkspaceId(null);
        }
      } catch (error) {
        console.error("Auth state error:", error);

        setUser(null);
        setUserRole(null);
        setWorkspaceId(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------
  // Context Value
  // ------------------------------------------------

  const value = {
    user,
    userRole,
    workspaceId,
    loading,

    register,
    login,
    logout,

    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
