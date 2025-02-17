import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProtectedPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await api.get('/auth/protected');
        setData(response.data.message);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error fetching protected data.');
      }
    };
    fetchProtectedData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <h2>Protected Page</h2>
      {data && <p>{data}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ProtectedPage;
