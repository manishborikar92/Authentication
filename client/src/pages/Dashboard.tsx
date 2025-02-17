import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Welcome {user?.email || 'User'}!</p>
      <button onClick={handleLogout}>Logout</button>
      <p>
        Go to <Link to="/protected">Protected Page</Link>
      </p>
    </div>
  );
};

export default Dashboard;
