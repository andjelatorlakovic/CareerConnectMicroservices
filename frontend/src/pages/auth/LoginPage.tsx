import { Link } from 'react-router-dom';

import LoginForm from '../../components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div style={page}>
      <div style={box}>
        <h1 style={heading}>CareerConnect</h1>

        <h2 style={subheading}>Login</h2>

        <LoginForm />

        <p style={paragraph}>
          Don't have an account?{' '}
          <Link to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1a1a2e',
  padding: 20,
};

const box: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  padding: 40,
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
};

const heading: React.CSSProperties = {
  color: '#e94560',
  textAlign: 'center',
  margin: '0 0 8px',
  fontSize: 28,
  fontWeight: 800,
};

const subheading: React.CSSProperties = {
  margin: '0 0 20px',
  fontWeight: 400,
  fontSize: 18,
};

const paragraph: React.CSSProperties = {
  textAlign: 'center',
  marginTop: 16,
  fontSize: 14,
};