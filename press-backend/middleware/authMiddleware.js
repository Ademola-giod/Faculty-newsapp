import { auth } from 'express-oauth2-jwt-bearer';
import 'dotenv/config';
import axios from 'axios';
import User from '../models/User.js';
import { ADMIN_EMAILS } from './whitelist.js';

// 1. Verify Auth0 Token
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});
   console.log("JWT CHECK CONFIG:", {
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256'
  });


// 2. Attach user to request (FIXED VERSION)
export const attachUserInfo = async (req, res, next) => {
  try {
    console.log("AUTH PAYLOAD:", req.auth);

    const auth0Id = req.auth.payload?.sub;

    if (!auth0Id) {
      return res.status(401).json({
        message: "Invalid Auth0 token (missing sub)"
      });
    }

    let user = await User.findOne({ auth0Id });

    // If user already exists → use it
    if (user) {
      req.user = user;
      return next();
    }

    // 🔥 IMPORTANT FIX: fetch real user profile from Auth0
    const accessToken = req.auth.token;

    const userInfoRes = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const { email, name, picture, sub } = userInfoRes.data;

    if (!email) {
      return res.status(400).json({
        message: "Auth0 userinfo missing email. Check Auth0 settings."
      });
    }

    const isAdminUser = ADMIN_EMAILS.includes(email);

    user = await User.create({
      auth0Id: sub,
      email,
      fullName: name || email,
      avatar: picture || '',
      role: isAdminUser ? 'ADMIN' : 'GUEST',
      isActiveStaff: isAdminUser
    });

    req.user = user;

    console.log("USER ATTACHED:", user);

    next();

  } catch (err) {
    console.error("ATTACH USER ERROR:", err.response?.data || err.message);

    res.status(500).json({
      message: "Auth sync failed",
      error: err.message
    });
  }
};