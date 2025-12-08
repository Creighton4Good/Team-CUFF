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
  first_name?: string;
  last_name?: string;
  is_admin: boolean | null;
  notification_type?: string;
  dietary_preferences?: string | null;
};

type UserContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  isAdmin: false,
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // 🔴 Use the same user ID you’re testing with
        const CURRENT_USER_ID = 1; // non-admin in your table

        const data = await fetchUserById(CURRENT_USER_ID);
        console.log("[UserContext] loaded user", data);
        setUser(data);
        setIsAdmin(!!data?.is_admin);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
