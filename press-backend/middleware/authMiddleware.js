import { auth } from 'express-oauth2-jwt-bearer';
import 'dotenv/config';
import axios from 'axios';
import User from '../models/User.js';
import { ADMIN_EMAILS } from './whiteList.js';

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

const isWhitelistedAdmin = (email = '') =>
  ADMIN_EMAILS.some(
    (admin) => admin.trim().toLowerCase() === email.trim().toLowerCase()
  );

export const attachUserInfo = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;

    if (!auth0Id) {
      return res.status(401).json({
        message: 'Invalid Auth0 token (missing sub)'
      });
    }

    const accessToken = req.auth.token;

    const userInfoRes = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const { email, name, nickname, picture, sub } = userInfoRes.data;

    if (!email) {
      return res.status(400).json({
        message: 'Auth0 userinfo missing email'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // prefer a real name (e.g. from Google); fall back to nickname
    // (email local-part, no domain); last resort: strip domain ourselves
    const displayName =
      (name && name !== email)
        ? name
        : (nickname || normalizedEmail.split('@')[0]);

    const isAdminUser = isWhitelistedAdmin(normalizedEmail);
    const newRole = isAdminUser ? 'ADMIN' : 'GUEST';
    const shouldBeActive = newRole === 'ADMIN';

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = await User.create({
        auth0Id: sub,
        email: normalizedEmail,
        fullName: displayName,
        avatar: picture || '',
        role: newRole,
        isActiveStaff: shouldBeActive
      });
    } else {
      const changed =
        user.role !== newRole ||
        user.email !== normalizedEmail ||
        (!user.nameSetByUser && user.fullName !== displayName) ||
        user.avatar !== (picture || '') ||
        user.isActiveStaff !== shouldBeActive;

      if (changed) {
        user.email = normalizedEmail;
        if (!user.nameSetByUser) {
          user.fullName = displayName;
        }
        user.avatar = picture || '';
        user.role = newRole;
        user.isActiveStaff = shouldBeActive;

        await user.save();
      }
    }

    req.user = user;
    next();

  } catch (err) {
    console.error('Message:', err.message);
    console.error('Status:', err.response?.status);
    console.error('Response:', err.response?.data);
    console.error('Stack:', err.stack);

    res.status(500).json({
      message: 'Authentication sync failed',
      error: err.message
    });
  }
};