import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="container mx-auto mt-10 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Smart Travel Safety</h1>
      <p className="text-lg mb-8">Your safety is our priority. We leverage technology to make your travels safer.</p>
      <div className="space-x-4">
        <Link to="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Register as Tourist
        </Link>
        <Link to="/login" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
          Login
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
