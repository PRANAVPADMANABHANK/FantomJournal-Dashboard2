const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Function to generate access and refresh tokens
const generateTokens = (user) => {
    console.log(user, "generate token user")

    const accessToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );

    console.log(accessToken, "access")
    console.log(refreshToken, "refresh")


    return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {

    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password, // This will be the hashed password
        });


        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body; // Only need email and password for login

    try {
        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        res.status(200).json({
            message: 'Login successful', accessToken, refreshToken, user: {
                name: user.name,
                email: user.email,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(403).json({ message: 'No refresh token provided' });
    }

    try {
        // Verify refresh token
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            // Generate new tokens
            const user = { _id: decoded.userId, email: decoded.email }; // Normally, you'd find the user in the database
            const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

            res.status(200).json({ accessToken, refreshToken: newRefreshToken });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
