import { auth } from 'express-oauth2-jwt-bearer';
import 'dotenv/config';
import axios from 'axios';
import User from '../models/User.js';
import { ADMIN_EMAILS } from './whiteList.js';

// ───────────────── JWT verification ─────────────────
export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// helper 
const isWhitelistedAdmin = (email = '') =>
  ADMIN_EMAILS.some(
    (admin) =>
      admin.trim().toLowerCase() === email.trim().toLowerCase()
  );

//  attach user ─
export const attachUserInfo = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;


    // get the unique id and email 
    console.log("Auth0 ID:", auth0Id);
    console.log("Token email:", req.auth?.payload?.email);

    if (!auth0Id) {
      return res.status(401).json({
        message: 'Invalid Auth0 token (missing sub)'
      });
    }

    // Get fresh profile from Auth0 every request
    const accessToken = req.auth.token;

    const userInfoRes = await axios.get(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const {
      email,
      name,
      picture,
      sub
    } = userInfoRes.data;

    if (!email) {
      return res.status(400).json({
        message: 'Auth0 userinfo missing email'
      });
    }
  

    
    const normalizedEmail = email.trim().toLowerCase();
    const isAdminUser = isWhitelistedAdmin(normalizedEmail);
    const newRole = isAdminUser ? 'ADMIN' : 'GUEST';
    const shouldBeActive = newRole === 'ADMIN';

    // Find existing user
    let user = await User.findOne({ auth0Id });

    // checking if the userauth0Id exist || duplicate id 
    console.log("User found by auth0Id:", user);

    if (!user) {
      user = await User.create({
        auth0Id: sub,
        email: normalizedEmail,
        fullName: name || normalizedEmail,
        avatar: picture || '',
        role: newRole,
        isActiveStaff: shouldBeActive
      });

      console.log(' New user created:', normalizedEmail, newRole);

    } else {
      const changed =
        user.role !== newRole ||
        user.email !== normalizedEmail ||
        user.fullName !== (name || normalizedEmail) ||
        user.avatar !== (picture || '') ||
        user.isActiveStaff !== shouldBeActive;

      if (changed) {
        user.email = normalizedEmail;
        user.fullName = name || normalizedEmail;
        user.avatar = picture || '';
        user.role = newRole;
        user.isActiveStaff = shouldBeActive;

        await user.save();

        console.log(' User updated:', normalizedEmail, newRole);
      }
    }
    req.user = user;
    next();

  } 
  // catch (err) {
  //   console.error(' AUTH MIDDLEWARE ERROR:', err.response?.data || err.message);

  //   res.status(500).json({
  //     message: 'Authentication sync failed'
  //   });
  // }


  catch (err) {
  console.error('========== AUTH MIDDLEWARE ERROR ==========');
  console.error('Message:', err.message);
  console.error('Status:', err.response?.status);
  console.error('Response:', err.response?.data);
  console.error('Stack:', err.stack);
  console.error('============================================');

  res.status(500).json({
    message: 'Authentication sync failed',
    error: err.message
  });
}

};
