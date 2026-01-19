import { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';

function App() {
  // --- STATE MANAGEMENT ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [urls, setUrls] = useState([]);  
  
  // Inputs for Dashboard
  const [inputUrl, setInputUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');  
  
  // Inputs for Auth (Login/Register)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); 
  const [error, setError] = useState(null);

  // --- EFFECT: Fetch URLs if logged in ---
  useEffect(() => {
    if (token) {
      fetchUrls();
    }
  }, [token]);

  // --- AUTH FUNCTIONS ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    const endpoint = isRegistering ? 'register' : 'login';
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/${endpoint}`, { email, password });      
      if (!isRegistering) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
      } 
      else { 
        setIsRegistering(false);
        alert("Registration successful! Please login.");
      }
    } 
    catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUrls([]);
  };

  // --- DATA FUNCTIONS ---
  const fetchUrls = async () => {
    try {  
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/shortUrls`, {
        headers: { 'x-auth-token': token }
      });
      setUrls(res.data);
    } 
    catch (err) {
      console.error(err);
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/shortUrls`, 
        { fullUrl: inputUrl, customSlug: customSlug },
        { headers: { 'x-auth-token': token } } 
      );
      setInputUrl('');
      setCustomSlug('');
      fetchUrls();
    } 
    catch (err) {
      setError(err.response?.data?.message || "Error creating link");
    }
  };

  // --- CONDITIONAL RENDERING ---
  if (!token) {
    return (
      <div className="App" style={{ padding: '2rem', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <h1>{isRegistering ? "Register" : "Login"}</h1>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px' }} />
          <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px' }} />
          <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>
            {isRegistering ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: '1rem', cursor: 'pointer', color: 'blue' }} onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? "Already have an account? Login" : "Need an account? Register"}
        </p>
      </div>
    );
  }

  return (
    <div className="App" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '80%', margin: '0 auto' }}>
        <h1>My Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '5px 10px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>Logout</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input required type="url" placeholder="Paste full URL here..." value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} style={{ padding: '10px', width: '300px' }} />
          <input type="text" placeholder="Custom alias (optional)" value={customSlug} onChange={(e) => setCustomSlug(e.target.value)} style={{ padding: '10px', width: '150px' }} />
          <button type="submit" style={{ padding: '10px 20px' }}>Shrink</button>
        </div>
      </form>

      <table style={{ margin: '2rem auto', width: '90%', textAlign: 'left' }}>
        <thead>
          <tr>
            <th>Original URL</th>
            <th>Short URL</th>
            <th>QR Code</th>
            <th>Clicks</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => {
             const shortLink = `${import.meta.env.VITE_API_BASE_URL}/${url.short}`;             
             return (
              <tr key={url._id}>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a href={url.full} target="_blank" rel="noreferrer" title={url.full}>{url.full}</a>
                </td>
                <td><a href={shortLink} target="_blank" rel="noreferrer">{url.short}</a></td>
                <td><div style={{ background: 'white', padding: '5px', display: 'inline-block' }}><QRCodeSVG value={shortLink} size={50} /></div></td>
                <td style={{ textAlign: 'center' }}>{url.clicks}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;