import User from '../models/User.js';
import Whitelist from '../models/Whitelist.js'; // Import the list we just made

export const syncUser = async (req, res) => {
  // const { email, name, picture, sub } = req.body;

  const { email, name, picture, sub } = req.auth.payload; // Get user info from the JWT payload instead of req.body
  const lowerEmail = email.toLowerCase();

  try {
    // 1. Check if user already exists in our main User collection
    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      // 2. NEW LOGIC: Check if this email is on the EiC's Whitelist
      const whitelistEntry = await Whitelist.findOne({ 
        email: lowerEmail, 
        isActive: true 
      });

      let assignedRole = 'GUEST';
      let isActiveStaff = false;

      if (whitelistEntry) {
        // If they are on the list, give them their specific role (ADMIN or SUPER_ADMIN)
        assignedRole = whitelistEntry.role;
        isActiveStaff = true;
      } 
      // 3. If not on VIP list, check the UI Student domain
      else if (lowerEmail.endsWith('.ui.edu.ng')) {
        assignedRole = 'STUDENT';
      }

      // 4. Create the user with the correctly determined role
      user = await User.create({
        auth0Id: sub,
        email: lowerEmail,
        // user get username from their mail
        fullName: name || lowerEmail.split('@')[0],

        avatar: picture,
        role: assignedRole,
        isActiveStaff: isActiveStaff
      });
    } else {
       // OPTIONAL: If user exists, update their profile picture/name in case they changed it in Auth0
       user.fullName = name || user.fullName ;
       
       user.avatar = picture;

       await user.save();
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
       error: error.message 

      });
  }
};