import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authApi } from '../../api_services/auth/AuthApiService';
import { Role } from '../../models/auth/Role';
import type { RegisterRequest } from '../../types/auth/RegisterRequest';

export default function RegisterForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterRequest>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: Role.Candidate,
  });

  const [error, setError] = useState('');
  const namesRequired = form.role === Role.Candidate;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError('');

    const response = await authApi.register(form);

    if (!response.success) {
      setError(response.message);
      return;
    }

    navigate('/login');
  }

  return (
    <>
      <style>{`
        .register-page {
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

        .register-card {
          width: 100%;
          max-width: 430px;

          background: #ffffff;

          border-radius: 18px;

          padding: 40px 45px;

          box-sizing: border-box;

          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
        }

        .register-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .register-header h1 {
          margin: 0 0 8px;

          font-size: 34px;
          font-weight: 700;

          color: #ef476f;

          letter-spacing: -1px;
        }

        .register-header p {
          margin: 0;

          font-size: 15px;

          color: #8c8c9a;
        }

        .register-form {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .register-form-group {
          display: flex;
          flex-direction: column;

          align-items: flex-start;

          gap: 8px;

          width: 100%;
        }

        .register-form-group label {
          display: block;

          width: 100%;

          text-align: left;

          font-size: 14px;
          font-weight: 600;

          color: #333344;
        }

        .register-form-group input,
        .register-form-group select {
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

        .register-form-group input::placeholder {
          color: #a6a6b2;
        }

        .register-form-group input:focus,
        .register-form-group select:focus {
          border-color: #ef476f;

          background: #ffffff;

          box-shadow: 0 0 0 3px rgba(239, 71, 111, 0.12);
        }

        .register-form-group select {
          cursor: pointer;
        }

        .register-error {
          padding: 12px 14px;

          border-radius: 8px;

          background: #fff0f3;

          border: 1px solid #ffc5d1;

          color: #d93658;

          font-size: 14px;

          text-align: left;
        }

        .register-button {
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

        .register-button:hover {
          background: #df3d65;

          transform: translateY(-1px);

          box-shadow: 0 6px 15px rgba(239, 71, 111, 0.25);
        }

        .register-button:active {
          transform: translateY(0);
        }

        .register-footer {
          display: flex;
          justify-content: center;
          align-items: center;

          gap: 6px;

          margin-top: 25px;

          font-size: 14px;

          color: #888895;
        }

        .register-footer button {
          border: none;

          background: none;

          padding: 0;

          color: #ef476f;

          font-size: 14px;
          font-weight: 600;

          cursor: pointer;
        }

        .register-footer button:hover {
          text-decoration: underline;
        }

        @media (max-width: 520px) {
          .register-page {
            padding: 15px;
          }

          .register-card {
            max-width: 100%;

            padding: 35px 25px;

            border-radius: 16px;
          }

          .register-header h1 {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="register-page">
        <div className="register-card">

          <div className="register-header">
            <h1>CareerConnect</h1>
            <p>Create your account</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="register-form"
          >

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <div className="register-form-group">
              <label htmlFor="firstName">
                First name{namesRequired ? '' : ' (optional)'}
              </label>

              <input
                id="firstName"
                type="text"
                placeholder="Enter first name"
                value={form.firstName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    firstName: event.target.value,
                  })
                }
                required={namesRequired}
                minLength={2}
                maxLength={80}
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="lastName">
                Last name{namesRequired ? '' : ' (optional)'}
              </label>

              <input
                id="lastName"
                type="text"
                placeholder="Enter last name"
                value={form.lastName}
                onChange={(event) =>
                  setForm({
                    ...form,
                    lastName: event.target.value,
                  })
                }
                required={namesRequired}
                minLength={2}
                maxLength={80}
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email: event.target.value,
                  })
                }
                required
                maxLength={254}
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password: event.target.value,
                  })
                }
                minLength={6}
                maxLength={128}
                required
              />
            </div>

            <div className="register-form-group">
              <label htmlFor="role">
                Account type
              </label>

              <select
                id="role"
                value={form.role}
                onChange={(event) =>
                  setForm({
                    ...form,
                    role:
                      event.target.value as RegisterRequest['role'],
                  })
                }
              >
                <option value={Role.Candidate}>
                  Candidate
                </option>

                <option value={Role.Company}>
                  Company
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="register-button"
            >
              Sign up
            </button>

          </form>

          <div className="register-footer">
            <span>Already have an account?</span>

            <button
              type="button"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
