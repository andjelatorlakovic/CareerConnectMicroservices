import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { candidateApi } from '../../api_services/candidate/CandidateApiService';
import { companyApi } from '../../api_services/company/CompanyApiService';
import { useAuth } from '../../hooks/auth/useAuth';
import { Role } from '../../models/auth/Role';

const isFilled = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];
  allowIncompleteProfile?: boolean;
}

export default function ProtectedRoute({
  children,
  roles,
  allowIncompleteProfile = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    if (!user || allowIncompleteProfile || user.role === Role.Admin) {
      setProfileComplete(true);
      setCheckingProfile(false);
      return;
    }

    const activeUser = user;
    let active = true;

    async function checkProfile() {
      try {
        if (activeUser.role === Role.Company) {
          const profile = await companyApi.getCompanyProfile();
          const completed = [
            profile.name,
            profile.industry,
            profile.location,
            profile.description,
            profile.contactEmail,
            profile.contactPhone,
          ].every(isFilled);

          if (active) setProfileComplete(completed);
        } else if (activeUser.role === Role.Candidate) {
          const profile = await candidateApi.getCandidateProfile();
          const completed =
            isFilled(profile.bio) &&
            isFilled(profile.location) &&
            profile.skills.length > 0 &&
            profile.desiredJobCategories.length > 0;

          if (active) setProfileComplete(completed);
        }
      } catch {
        if (active) setProfileComplete(false);
      } finally {
        if (active) setCheckingProfile(false);
      }
    }

    void checkProfile();

    return () => {
      active = false;
    };
  }, [allowIncompleteProfile, user]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  if (checkingProfile) {
    return <p>Loading...</p>;
  }

  if (!profileComplete) {
    return (
      <Navigate
        to={
          user.role === Role.Company
            ? '/company-profile'
            : '/candidate-profile'
        }
        replace
      />
    );
  }

  return <>{children}</>;
}
