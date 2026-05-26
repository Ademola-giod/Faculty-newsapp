// 1. Only the Editor-in-Chief (SUPER_ADMIN)
export const isEiC = (req, res, next) => {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Editor-in-Chief only." });
  }
};

// 2. Either an Admin OR the EiC (Staff check)
export const isAdmin = (req, res, next) => {
  const allowed = ['ADMIN', 'SUPER_ADMIN'];
  // We check if they have the role AND if their account is marked active
  if (req.user && allowed.includes(req.user.role) && req.user.isActiveStaff) {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Press Staff only." });
  }
};

// 3. UI Students Only
export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'STUDENT') {
    next();
  } else {
    res.status(403).json({ message: "Access denied: UI Students only." });
  }
}; 