import Whitelist from '../models/Whitelist.js';

export const initializePress = async (req, res) => {
  try {
    const { eicInfo, staffList, sessionName } = req.body;

    // 1. Wipe old active status (to ensure only one session is live)
    await Whitelist.updateMany({ isActive: true }, { isActive: false });

    // 2. Prepare the data
    const entries = [
      // The Head
      { 
        email: eicInfo.email.toLowerCase(), 
        name: eicInfo.name, 
        role: 'SUPER_ADMIN', 
        session: sessionName 
      },
      // The Staff (12 or so)
      ...staffList.map(staff => ({
        email: staff.email.toLowerCase(),
        name: staff.name,
        role: 'ADMIN',
        session: sessionName
      }))
    ];

    // 3. Save to DB
    await Whitelist.insertMany(entries);

    res.status(201).json({ message: "NUESA Press Whitelist updated for the new session!" });
  } catch (error) {
    res.status(500).json({ message: "Setup failed", error: error.message });
  }
};