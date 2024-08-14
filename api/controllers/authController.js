const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');
const { response } = require('express');
const Payment = require('../models/paymentSchema'); // Adjust the path according to your file structure

// Function to generate access and refresh tokens
const generateTokens = (user) => {
    // console.log(user, "generate token user")

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

    // console.log(accessToken, "access")
    // console.log(refreshToken, "refresh")


    return { accessToken, refreshToken };
};

exports.signup = async (req, res) => {

    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            password: req.body.password, // This will be the hashed password
            payment: false  // Set the payment field to false by default
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
                mobile: user.mobile
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


function generateTransactionID() {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000000)
    const merchantPrefix = "T"
    const transactionID = `${merchantPrefix}${timestamp}${randomNum}`
    return transactionID;
}


exports.payment = async (req, res) => {
    const { name, mobile, amount } = req.body;
    const data = {
        merchantId: "PGTESTPAYUAT86",
        merchantTransactionId: generateTransactionID(),
        merchantUserId: "MUID123",
        name: name,
        amount: amount * 200,
        redirectUrl: "http://localhost:5040/api/phonepe/status",
        redirectMode: "POST",
        mobileNumber: mobile,
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };


     // Include additional user details
     const userDetails = {
        name: name,
        mobile: mobile,
        amount: amount
    };


    // Save the details temporarily for later use
    // Store this in a persistent storage or session
    req.session.userDetails = userDetails;

    console.log(req.session, "payment")

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString('base64');
    const key = '96434309-7796-489d-8924-ab56988a6076';
    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + '###' + keyIndex;


    const URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    const options = {
        method: 'POST',
        url: URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payloadMain
        }
    };

    try {
        const response = await axios.request(options);
        return res.status(200).json({ redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
    } catch (error) {
        console.error(error.response);
        return res.status(500).json({ error: 'Payment initiation failed.' });
    }
};


exports.status = async (req, res) => {
    try {
        // console.log("Received status request:", req.body);

        // Extract necessary values from the request body
        const { transactionId: merchantTransactionId, merchantId } = req.body; // Extract userId here
        const keyIndex = 1;
        const key = '96434309-7796-489d-8924-ab56988a6076';

        // Create the checksum string and hash it
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + keyIndex;

        // Create the URL for status check
        const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`;

        // Set up request options
        const options = {
            method: "GET",
            url: URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            }
        };

        // Make the API request to get the transaction status
        const response = await axios.request(options);
        // Determine success or failure based on response
        const isSuccess = response.data.code === "PAYMENT_SUCCESS"; // Check based on 'code' field
        console.log(response.data, "response got")


         // Retrieve user details from temporary storage
         const userDetails = req.session.userDetails || {};
         console.log('Retrieved Session Data:', req.session);
         
        const { name, mobile, amount } = userDetails;

        const paymentData = {
            merchantId: response.data.data.merchantId,
            merchantTransactionId: response.data.data.merchantTransactionId,
            transactionId: response.data.data.transactionId,
            amount: response.data.data.amount,
            originalAmount: amount, // Store the original amount
            name: name, // Store user name
            mobile: mobile, // Store user mobile
            state: response.data.data.state,
            responseCode: response.data.data.responseCode,
            paymentInstrument: response.data.data.paymentInstrument,
            success: isSuccess,
            message: response.data.message,
            createdAt: new Date()
        };

        // Assuming you have a Payment model in Mongoose
        const paymentRecord = new Payment(paymentData);
        await paymentRecord.save();

        // Redirect to the appropriate route based on payment success or failure
        if (isSuccess) {
            return res.redirect('http://localhost:4200/landing');
        } else {
            return res.redirect('http://localhost:4200/failed');
        }
    } catch (error) {
        console.error("Error fetching status:", error);
        return res.redirect('http://localhost:4200/failed');
    }
};