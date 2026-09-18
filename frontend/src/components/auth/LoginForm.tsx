import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '../../api_services/auth/AuthApiService';
import { candidateApi } from '../../api_services/candidate/CandidateApiService';
import { companyApi } from '../../api_services/company/CompanyApiService';
import { useAuth } from '../../hooks/auth/useAuth';
import { Role } from '../../models/auth/Role';

const isFilled = (value: unknown): boolean =>
  typeof value === 'string' && value.trim().length > 0;

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError('');

    const response = await authApi.login({
      email,
      password
    });

    if (!response.success || !response.data) {
      setError(response.message);
      return;
    }

    login(response.data);

    if (response.data.role === Role.Company) {
      try {
        const profile = await companyApi.getCompanyProfile();
        const completed = [
          profile.name,
          profile.industry,
          profile.location,
          profile.description,
          profile.contactEmail,
          profile.contactPhone,
        ].every(isFilled);

        navigate(completed ? '/my-jobs' : '/company-profile');
      } catch {
        navigate('/company-profile');
      }
    } else if (response.data.role === Role.Candidate) {
      try {
        const profile = await candidateApi.getCandidateProfile();
        const completed =
          isFilled(profile.bio) &&
          isFilled(profile.location) &&
          profile.skills.length > 0 &&
          profile.desiredJobCategories.length > 0;

        navigate(completed ? '/jobs' : '/candidate-profile');
      } catch {
        navigate('/candidate-profile');
      }
    } else {
      navigate('/admin/users');
    }
  }

  return (
    <>
      <style>{`
        .login-page {
          position: fixed;
          inset: 0;

          width: 100vw;
          height: 100vh;

          display: flex;
          justify-content: center;
          align-items: center;

          background: #19182d;

          padding: 20px;
          box-sizing: border-box;

          overflow-y: auto;
        }

        .login-card {
          width: 100%;
          max-width: 430px;

          background: #ffffff;

          border-radius: 18px;

          padding: 40px 45px;

          box-sizing: border-box;

          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
        }

        .login-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .login-header h1 {
          margin: 0 0 8px;

          font-size: 34px;
          font-weight: 700;

          color: #ef476f;

          letter-spacing: -1px;
        }

        .login-header p {
          margin: 0;

          font-size: 15px;

          color: #8c8c9a;
        }

        .login-form {
          display: flex;
          flex-direction: column;

          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;

          align-items: flex-start;

          gap: 8px;

          width: 100%;
        }

        .form-group label {
          display: block;

          width: 100%;

          text-align: left;

          font-size: 14px;
          font-weight: 600;

          color: #333344;
        }

        .form-group input {
          width: 100%;
          height: 50px;

          padding: 0 15px;

          box-sizing: border-box;

          border: 1px solid #d9d9e2;
          border-radius: 9px;

          background: #fafafd;

          font-size: 15px;
          color: #333344;

          outline: none;

          transition: all 0.2s ease;
        }

        .form-group input::placeholder {
          color: #a6a6b2;
        }

        .form-group input:focus {
          border-color: #ef476f;

          background: #ffffff;

          box-shadow: 0 0 0 3px rgba(239, 71, 111, 0.12);
        }

        .login-button {
          width: 100%;
          height: 50px;

          margin-top: 4px;

          border: none;
          border-radius: 9px;

          background: #ef476f;
          color: white;

          font-size: 16px;
          font-weight: 600;

          cursor: pointer;

          transition: all 0.2s ease;
        }

        .login-button:hover {
          background: #df3d65;

          transform: translateY(-1px);

          box-shadow: 0 6px 15px rgba(239, 71, 111, 0.25);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .login-error {
          padding: 12px 14px;

          border-radius: 8px;

          background: #fff0f3;

          border: 1px solid #ffc5d1;

          color: #d93658;

          font-size: 14px;

          text-align: left;
        }

        .login-footer {
          display: flex;
          justify-content: center;
          align-items: center;

          gap: 6px;

          margin-top: 25px;

          font-size: 14px;

          color: #888895;
        }

        .login-footer button {
          border: none;

          background: none;

          padding: 0;

          color: #ef476f;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }

        .login-footer button:hover {
          text-decoration: underline;
        }

        @media (max-width: 520px) {
          .login-page {
            padding: 15px;
          }

          .login-card {
            max-width: 100%;

            padding: 35px 25px;

            border-radius: 16px;
          }

          .login-header h1 {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          <div className="login-header">
            <h1>CareerConnect</h1>
            <p>Please sign in to your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                maxLength={254}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
                maxLength={128}
              />
            </div>

            <button
              type="submit"
              className="login-button"
            >
              Sign in
            </button>

          </form>

          <div className="login-footer">
            <span>Don't have an account?</span>

            <button
              type="button"
              onClick={() => navigate('/register')}
            >
              Register
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
