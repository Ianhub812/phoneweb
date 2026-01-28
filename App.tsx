
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicPage from './components/PublicPage';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { SiteContent, User } from './types';
import { DEFAULT_CONTENT, STORAGE_KEY, AUTH_KEY } from './constants';

// Context for shared site content
interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: SiteContent) => void;
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within a ContentProvider");
  return context;
};

const App: React.FC = () => {
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load published content
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setContent(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved content", e);
      }
    }

    // Load auth state
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
      setUser({ username: auth, isAuthenticated: true });
    }
  }, []);

  const updateContent = (newContent: SiteContent) => {
    setContent(newContent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
  };

  const login = (username: string) => {
    setUser({ username, isAuthenticated: true });
    localStorage.setItem(AUTH_KEY, username);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, user, login, logout }}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/login" element={user?.isAuthenticated ? <Navigate to="/admin" /> : <Login />} />
          <Route 
            path="/admin" 
            element={user?.isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
        </Routes>
      </HashRouter>
    </ContentContext.Provider>
  );
};

export default App;
