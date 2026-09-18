import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { Role } from './models/auth/Role';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/protected_route/ProtectedRoute';
import CompanyProfilePage from './pages/company/CompanyProfilePage';
import MyJobsPage from './pages/company/MyJobsPage';
import CreateJobPage from './pages/company/CreateJobPage';
import MyJobDetailsPage from './pages/company/MyJobDetailsPage';
import JobQuestionsPage from './pages/company/JobQuestionsPage';
import JobApplicationsPage from './pages/company/JobApplicationsPage';
import EditJobPage from './pages/company/EditJobPage';
import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import JobsPage from './pages/candidate/JobsPage';
import JobDetailsPage from './pages/candidate/JobDetailsPage';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';
import MatchingJobsPage from './pages/candidate/MatchingJobsPage';
import NotificationsPage from './pages/candidate/NotificationsPage';
import AccountPage from './pages/shared/AccountPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCompanyJobsPage from './pages/admin/AdminCompanyJobsPage';
import ApiErrorToast from './components/shared/ApiErrorToast';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ApiErrorToast />
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute
                roles={[Role.Company]}
                allowIncompleteProfile
              >
                <CompanyProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-job"
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/my-jobs/:id" 
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <MyJobDetailsPage />
              </ProtectedRoute>
          } 
          />
          <Route
            path="/my-jobs/:id/questions"
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <JobQuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs/:id/applications"
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <JobApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              <ProtectedRoute roles={[Role.Company]}>
                <EditJobPage />
              </ProtectedRoute>
            }
          />     
          <Route
            path="/candidate-profile"
            element={
              <ProtectedRoute
                roles={[Role.Candidate]}
                allowIncompleteProfile
              >
                <CandidateProfilePage />
              </ProtectedRoute>
            }
          />    
          <Route
            path="/jobs"
            element={
              <ProtectedRoute roles={[Role.Candidate]}>
                <JobsPage />
              </ProtectedRoute>
            }
          />
            <Route
            path="/jobs/:id"
            element={
              <ProtectedRoute roles={[Role.Candidate]}>
                <JobDetailsPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/my-applications"
            element={
              <ProtectedRoute roles={[Role.Candidate]}>
                <MyApplicationsPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/matching-jobs"
            element={
              <ProtectedRoute roles={[Role.Candidate]}>
                <MatchingJobsPage />
              </ProtectedRoute>
            }
          />
            <Route
            path="/notifications"
            element={
              <ProtectedRoute roles={[Role.Candidate]}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
           <Route
            path="/admin"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <Navigate to="/admin/users" replace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies/:userId/jobs"
            element={
              <ProtectedRoute roles={[Role.Admin]}>
                <AdminCompanyJobsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
