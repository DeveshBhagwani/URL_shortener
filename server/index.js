const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const SECRET_KEY = "Ihse6920";
app.use(express.json());
app.use(cors());


mongoose.connect('mongodb://localhost:27017/urlshortener')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

const urlSchema = new mongoose.Schema({
    full: { type: String, required: true },
    short: { type: String, required: true, default: shortid.generate },
    clicks: { type: Number, required: true, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    createdAt: { type: Date, default: Date.now, expires: 86400 }
});
const ShortUrl = mongoose.model('ShortUrl', urlSchema);

// --- MIDDLEWARE ---
// checks if the user sent a valid Token
const auth = (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ message: "No authentication token, access denied" });
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified.id; // Add the user ID to the request
        next(); // Let them pass
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- ROUTES ---
// 1. REGISTER User
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Save User
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.json({ message: "User registered successfully" });
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. LOGIN User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;        
        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
        // Create Token (The "ID Card")
        const token = jwt.sign({ id: user._id }, SECRET_KEY);
        res.json({ token, user: { id: user._id, email: user.email } });
    } 
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CREATE Short URL (Protected - Needs 'auth')
app.post('/shortUrls', auth, async (req, res) => {
    const { fullUrl, customSlug } = req.body;
    let urlData = { full: fullUrl, owner: req.user }; // Owner ID
    if (customSlug && customSlug.trim() !== "") {
        const existing = await ShortUrl.findOne({ short: customSlug });
        if (existing) return res.status(409).json({ message: "Alias taken" });
        urlData.short = customSlug;
    }
    try {
        const record = await ShortUrl.create(urlData);
        res.json(record);
    } 
    catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

// 4. GET MY URLs (Protected - Only show mine)
app.get('/shortUrls', auth, async (req, res) => {
    // Only find URLs where owner matches the logged-in user
    const shortUrls = await ShortUrl.find({ owner: req.user });
    res.json(shortUrls);
});

// 5. REDIRECT (Public - No Auth needed!)
app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);
    shortUrl.clicks++;
    await shortUrl.save();
    res.redirect(shortUrl.full);
});

app.listen(5000, () => console.log('Server started on port 5000'));