/**
 * Role-based access control middleware
 * Checks if the authenticated user has the required role(s)
 */

export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Access denied. Authentication required.' 
        });
      }

      const userRole = req.user.role;

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}` 
        });
      }

      // User has required role, proceed
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ 
        message: 'Internal server error in role validation' 
      });
    }
  };
};

// Specific role middlewares for convenience
export const adminOnly = roleMiddleware(['admin']);
export const vendorOnly = roleMiddleware(['vendor']);
export const customerOnly = roleMiddleware(['customer']);
export const vendorOrAdmin = roleMiddleware(['vendor', 'admin']);
export const customerOrVendor = roleMiddleware(['customer', 'vendor']);

export default roleMiddleware;
