import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Smart Travel Safety</Link>
        <div className="space-x-4">
          <Link to="/login" className="text-white">Login</Link>
          <Link to="/register" className="text-white">Register</Link>
          <Link to="/dashboard" className="text-white">Dashboard</Link>
          <Link to="/authority-dashboard" className="text-white">Authority</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
