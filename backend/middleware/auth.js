const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Check if user is authenticated
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.'
                });
            }

            // Check if user is verified
            if (!user.isVerified) {
                return res.status(403).json({
                    success: false,
                    message: 'Please verify your email before accessing this resource.'
                });
            }

            // Check if account is locked
            if (user.isLocked) {
                return res.status(423).json({
                    success: false,
                    message: 'Account is temporarily locked. Please try again later.'
                });
            }

            // Attach user to request object
            req.user = user;
            next();

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }

            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            throw error;
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error authenticating user'
        });
    }
};

/**
 * Grant access to specific roles
 * @param  {...string} roles - Allowed user types
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }

        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.userType}' is not authorized to access this route`
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Check for token in cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        // If no token, continue without user
        if (!token) {
            return next();
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await User.findById(decoded.id);

            if (user && user.isActive && user.isVerified) {
                req.user = user;
            }
        } catch (error) {
            // Silently fail - optional auth doesn't require valid token
            console.log('Optional auth failed:', error.message);
        }

        next();

    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even on error
    }
};

/**
 * Check if user owns the resource
 */
exports.checkOwnership = (resourceModel, resourceIdParam = 'id', userField = 'user') => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[resourceIdParam];
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Allow admins to access any resource
            if (req.user.userType === 'admin') {
                return next();
            }

            // Check if user owns the resource
            const resourceUserId = resource[userField]?.toString() || resource[userField];
            const requestUserId = req.user._id.toString();

            if (resourceUserId !== requestUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }

            // Attach resource to request for later use
            req.resource = resource;
            next();

        } catch (error) {
            console.error('Ownership check error:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

/**
 * Verify email before accessing route
 */
exports.requireVerified = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (!req.user.isVerified) {
        return res.status(403).json({
            success: false,
            message: 'Please verify your email to access this feature'
        });
    }

    next();
};

/**
 * Check if user is admin
 */
exports.isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

/**
 * Check if user is technician
 */
exports.isTechnician = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.user.userType !== 'technician' && req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Technician access required'
        });
    }

    next();
};

/**
 * Check if user is customer
 */
exports.isCustomer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }

    if (req.user.userType !== 'customer' && req.user.userType !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Customer access required'
        });
    }

    next();
};
