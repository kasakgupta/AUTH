import userModel from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import sessionModel from '../models/session.model.js';

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
        message: 'User registered successfully',
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

const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const session = await sessionModel.findOne({ refreshTokenHash, revoked: false });
    if (!session) {
        return res.status(401).json({ message: 'Invalid refresh token' });
    }


    const accessToken = jwt.sign({
        id: decoded.id,
    },
        config.JWT_SECRET,
        {
            expiresIn: '15m'
        }
    );

    const newRefreshToken = jwt.sign({
        id: decoded.id,
    },
        config.JWT_SECRET,
        {
            expiresIn: '7d'
        }
    );
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const session = await sessionModel.findOne({
            refreshTokenHash, revoked: false
        });
        if (!session) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        session.revoked = true;
        await session.save();
    }
}