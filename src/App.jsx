import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import Layout from "./components/Layout";
import Discover from "./pages/Discover";
import AlbumPage from "./pages/AlbumPage";
import ArtistPage from "./pages/ArtistPage";
import Profile from "./pages/Profile";
import UserPage from "./pages/UserPage";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";

function Require({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="wrap" style={{ paddingTop: 40, color: "var(--muted)" }}>Loading…</div>;
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <LibraryProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/album/:id" element={<AlbumPage />} />
          <Route path="/artist/:name" element={<ArtistPage />} />
          <Route path="/u/:username" element={<UserPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/feed" element={<Require><Feed /></Require>} />
          <Route path="/profile" element={<Require><Profile /></Require>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </LibraryProvider>
  );
}
