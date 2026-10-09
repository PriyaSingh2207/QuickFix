import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles?: ("citizen" | "volunteer" | "admin")[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading, profileError, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Only hard block if there is a profile error AND no fallback profile was generated
  if (profileError && !profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h2>
        <p className="text-slate-500 mb-6 max-w-sm">{profileError}</p>
        <button
          onClick={() => refreshProfile()}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-sm text-slate-500">Loading profile...</span>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
