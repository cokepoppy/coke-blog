import { useAuth } from '../contexts/AuthContext';

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly = ({ children, fallback = null }: AdminOnlyProps) => {
  const { isAdmin } = useAuth();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
};
