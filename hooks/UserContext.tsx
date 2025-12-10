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

        const data = await fetchUserById(CURRENT_USER_ID);
        console.log("[UserContext] loaded user", data);
        
        setUser(data);
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

  return (
    <UserContext.Provider value={{ user, loading, isAdmin, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
