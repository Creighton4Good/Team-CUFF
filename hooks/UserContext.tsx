import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { fetchUserById } from "../lib/api";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const CURRENT_USER_ID = 1; // row with is_admin

        const raw = await fetchUserById(CURRENT_USER_ID);
        console.log("[UserContext] raw user", raw);

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
        
        console.log("[UserContext] normalized user", normalized);
        setUser(normalized);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

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
