import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// --- DATA ---
const TRIPS = [
  { id: 1, title: "Goa Beach Party", price: "200", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=500&auto=format&fit=crop" },
  { id: 2, title: "Maldives", price: "1200", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=500&auto=format&fit=crop" },
  { id: 3, title: "Himalayan Trek", price: "450", img: "https://images.unsplash.com/photo-1518002171953-a080ee802e12?w=500&auto=format&fit=crop" },
  { id: 4, title: "City of Lights (Paris)", price: "1800", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500&auto=format&fit=crop" }
];

// --- COMPONENT: NAVBAR ---
function Navbar({ user, logout }) {
  return (
    <nav className="website-nav">
      <div className="logo">✈️ Quest Travels</div>
      <div className="links">
        <Link to="/">Home</Link>
        {user ? (
          <>
            <Link to="/bookings">My Bookings</Link>
            <button onClick={logout} className="nav-btn">Logout ({user})</button>
          </>
        ) : (
          <Link to="/login" className="nav-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}

// --- PAGE: HOME (Trip List) ---
function Home({ user }) {
  const navigate = useNavigate();

  const handleBook = async (trip) => {
    if (!user) {
      alert("Please login to book a trip!");
      navigate('/login');
      return;
    }

    try {
      await axios.post('/api/book', { email: user, tripTitle: trip.title, price: trip.price });
      alert(`Success! You booked ${trip.title}`);
    } catch (err) {
      alert("Booking failed. Try again.");
    }
  };

  return (
    <div className="page-container">
      <header className="hero">
        <h1>Explore the World</h1>
        <p>Find your next adventure at unbeatable prices.</p>
      </header>
      <div className="trips-grid">
        {TRIPS.map(trip => (
          <div key={trip.id} className="trip-card">
            <img src={trip.img} alt={trip.title} />
            <div className="trip-info">
              <h3>{trip.title}</h3>
              <p className="price">${trip.price}</p>
              <button onClick={() => handleBook(trip)} className="btn-book">Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- PAGE: MY BOOKINGS ---
function MyBookings({ user }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (user) {
      axios.get(`/api/my-bookings?email=${user}`)
        .then(res => setBookings(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  return (
    <div className="page-container">
      <h2>My Booked Trips</h2>
      {bookings.length === 0 ? <p>No bookings yet.</p> : (
        <table className="booking-table">
          <thead>
            <tr>
              <th>Trip</th>
              <th>Price</th>
              <th>Date Booked</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, index) => (
              <tr key={index}>
                <td>{b.tripTitle}</td>
                <td>${b.price}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// --- PAGE: LOGIN/REGISTER ---
function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await axios.post(endpoint, { email, password });
      if (isLogin) {
        setUser(res.data.user || email);
        navigate('/'); // Go to Home after login
      } else {
        alert("Account created! Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Error");
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card">
        <h2>{isLogin ? 'Welcome Back' : 'Join Us'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <p onClick={() => setIsLogin(!isLogin)} className="switch-text">
          {isLogin ? "Need an account? Register" : "Have an account? Login"}
        </p>
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Navbar user={user} logout={() => setUser(null)} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/bookings" element={user ? <MyBookings user={user} /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Auth setUser={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;