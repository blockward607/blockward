
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { SchoolSetupWizard } from '@/components/admin/SchoolSetupWizard';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const SchoolAdmin = () => {
  const { school, isAdmin, loading } = useSchoolAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not an admin or doesn't have a school yet, show setup wizard
  if (!isAdmin || !school) {
    return <SchoolSetupWizard />;
  }

  // If user is an admin with a school, show the dashboard
  return <AdminDashboard />;
};

export default function SchoolAdminPage() {
  return (
    <ProtectedRoute>
      <SchoolAdmin />
    </ProtectedRoute>
  );
}
