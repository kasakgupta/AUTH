import UserModel from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export async function register(req, res) {
    const { username, email, password } = req.body;

    const isAlreadyRegistered = await UserModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isAlreadyRegistered) {
        return res.status(409).json({ message: 'Username or email already exists' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const user = new UserModel({
        username,
        email,
        password: hashedPassword
    });

    const token = jwt.sign({
        id: user._id,
    },
        config.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
        token,
    });
}

export async function getMe(req, res) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
}