import userModel from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import sessionModel from '../models/session.model.js';
import { sendEmail } from '../services/email.service.js';
import { generateOtp, OtpHTML } from '../utils/utils.js';
import otpModel from '../models/otp.model.js';

export async function register(req, res) {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await userModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isAlreadyRegistered) {
        return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const user = await userModel.create({
        username,
        email,
        password: hashedPassword
    });

    const otp = generateOtp();
    const htmlContent = OtpHTML(otp);

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    await otpModel.create({
        email,
        user: user._id,
        otpHash: otpHash
    });

    await sendEmail({ email, subject: "Otp Verification", text: `Your OTP is ${otp}`, html: htmlContent });

    

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            verified: user.verified
        }
    });
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.verified) {
        return res.status(400).json({ message: "Please verify your email before logging in" });
    }

    const hashedPassword = crypto.createHash('sha256')
        .update(password)
        .digest('hex');

    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }


    const refreshToken = jwt.sign({
        id: user._id,
    },
        config.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
    });

    const accessToken = jwt.sign({
        id: user._id,
        sessionId: session._id
    },
        config.JWT_SECRET,
        {
            expiresIn: '15m'
        }
    );
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
        message: 'User logged in successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        accessToken
    });
}

export async function getMe(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findById(decoded.id);
    res.status(200).json({
        message: "User retrieved successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'No refresh token provided'
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, config.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired refresh token'
        });
    }

    const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        return res.status(401).json({
            message: 'Invalid refresh token'
        });
    }

    const accessToken = jwt.sign(
        {
            id: decoded.id,
        },
        config.JWT_SECRET,
        {
            expiresIn: '15m'
        }
    );

    const newRefreshToken = jwt.sign(
        {
            id: decoded.id,
        },
        config.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );

    const newRefreshTokenHash = crypto
        .createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
        message: 'Token refreshed successfully',
        accessToken
    });
}

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await sessionModel.findOne({
        refreshTokenHash, revoked: false
    });
    if (!session) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    session.revoked = true;
    await session.save();
    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out successfully" });
}

export async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh Token not found" });
    }

    const decoded = jwt.verify(refreshToken, config.JWT_SECRET)

    await sessionModel.updateMany({
        user: decoded.id,
        revoked: false
    }, {
        revoked: true
    })

    res.clearCookie('refreshToken');
    res.status(200).json({ message: "Logged out from all devices successfully" });

}

export async function verifyEmail(req, res) {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpHash = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const otpRecord = await otpModel.findOne({ email, otpHash });

    if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await userModel.findByIdAndUpdate(
        otpRecord.user,
        { verified: true },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    await otpModel.deleteMany({ user: user._id });

    res.status(200).json({
        message: "Email verified successfully",
        user: {
            id: user._id,
            email: user.email,
            verified: user.verified
        },
    });
}