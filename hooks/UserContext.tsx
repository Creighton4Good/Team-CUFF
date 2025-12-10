import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser as useClerkUser } from "@clerk/clerk-expo";
import { fetchUserByEmail } from "../lib/api";

type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean | null;
  notificationType?: string;
  dietaryPreferences?: string | null;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
const { user: clerkUser, isLoaded } = useClerkUser();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      
        // Wait until Clerk finishes loading
      if (!isLoaded) return;

      // If no Clerk user, treat as logged out at CUFF level too
      if (!clerkUser) {
        console.log("[UserContext] no Clerk user; clearing CUFF user");
        setUser(null);
        setLoading(false);
        return;
      }

      const email =
        clerkUser.primaryEmailAddress?.emailAddress ?? "";
      if (!email) {
        console.warn("[UserContext] Clerk user has no email");
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        const raw = await fetchUserByEmail(email);
        console.log("[UserContext] raw CUFF user", raw);

        if (!raw) {
          console.log(
            "[UserContext] No CUFF row for this email; defaulting to non-admin"
          );
          setUser(null);
          return;
        }

        const normalized: User = {
            id: raw.id,
            email: raw.email,
            firstName: raw.firstName,
            lastName: raw.lastName,
            notificationType: raw.notificationType,
            dietaryPreferences: raw.dietaryPreferences,
        // accept multiple possible field names from backend
            isAdmin:
                raw.isAdmin ??
                (raw as any).is_admin ??
                (raw as any).admin ??
                false,
        };
        
        console.log("[UserContext] normalized CUFF user", normalized);
        setUser(normalized);
      } catch (err) {
        console.error("Failed to fetch CUFF user profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [clerkUser, isLoaded]);

  // Derive admin state directly from user object
  const isAdmin = !!user?.isAdmin;
  console.log("[UserContext] computed isAdmin =", isAdmin);

  return (
    <UserContext.Provider value={{ user, loading, isAdmin, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
