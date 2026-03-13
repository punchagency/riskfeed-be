/**
 * @swagger
 * tags:
 *   name: User
 *   description: User authentication and account management
 */

/**
 * @swagger
 * /api/v1/user/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: User profile (without sensitive fields)
 *
 *   patch:
 *     summary: Update current user profile (homeowner or contractor)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   zipcode:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *               notificationPreferences:
 *                 type: object
 *                 properties:
 *                   emailNotifications:
 *                     type: boolean
 *                   pushNotifications:
 *                     type: boolean
 *                   marketingCommunications:
 *                     type: boolean
 *               heardAboutRiskfeed:
 *                 type: object
 *                 properties:
 *                   source:
 *                     type: string
 *                   otherDetails:
 *                     type: string
 *               contractorData:
 *                 type: object
 *                 description: For contractors
 *                 properties:
 *                   companyName:
 *                     type: string
 *                   businessEmail:
 *                     type: string
 *                   businessPhone:
 *                     type: string
 *                   services:
 *                     type: array
 *                     items:
 *                       type: string
 *                   serviceAreas:
 *                     type: array
 *                     items:
 *                       type: string
 *                   teamSize:
 *                     type: string
 *                   insurance:
 *                     type: object
 *     responses:
 *       200:
 *         description: Updated user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Updated user profile (without sensitive fields)
 */

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user (homeowner or contractor)
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - address
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *               role:
 *                 type: string
 *                 enum: [user, contractor, admin]
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   zipcode:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *               heardAboutRiskfeed:
 *                 type: object
 *                 description: For homeowners
 *                 properties:
 *                   source:
 *                     type: string
 *                     enum: [online_search, google_search, friend_family_referral, contractor_referral, social_media, ad, other]
 *                   otherDetails:
 *                     type: string
 *               contractorData:
 *                 type: object
 *                 description: Required for contractors
 *                 properties:
 *                   companyName:
 *                     type: string
 *                   businessName:
 *                     type: string
 *                   licenseNumber:
 *                     type: string
 *                     deprecated: true
 *                   licenses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         number: { type: string }
 *                         description: { type: string }
 *                         state: { type: string }
 *                   corporationType:
 *                     type: string
 *                     enum: [sole_proprietorship, partnership, limited_liability_company, corporation, other]
 *                   yearEstablished:
 *                     type: number
 *                   taxId:
 *                     type: string
 *                   businessEmail:
 *                     type: string
 *                   businessPhone:
 *                     type: string
 *                   businessWebsite:
 *                     type: string
 *                   businessAddresses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         street: { type: string }
 *                         zipcode: { type: string }
 *                         city: { type: string }
 *                         state: { type: string }
 *                         country: { type: string }
 *                   services:
 *                     type: array
 *                     items:
 *                       type: string
 *                   serviceAreas:
 *                     type: array
 *                     items:
 *                       type: string
 *                   teamSize:
 *                     type: string
 *                     enum: [solo, one_to_five, six_to_ten, eleven_to_twenty-five, twenty-five_to_fifty, fifty_plus]
 *                   insurance:
 *                     type: object
 *                     properties:
 *                       provider:
 *                         type: string
 *                       policyNumber:
 *                         type: string
 *                       coverageDetails:
 *                         type: string
 *                       expiryDate:
 *                         type: string
 *                         format: date
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 activationCode:
 *                   type: string
 *                   description: Activation code sent to the user email (returned for testing)
 *                 user:
 *                   type: object
 *                   description: Newly created user (without sensitive fields)
 *
 * /api/v1/user/linked-accounts:
 *   post:
 *     summary: Add a linked user to current account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, phoneNumber, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *               password: { type: string }
 *               accountRole: { type: string, enum: [owner, member] }
 *     responses:
 *       201:
 *         description: Linked user created
 *   get:
 *     summary: Get all linked users for current account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of linked users
 *
 * /api/v1/user/linked-accounts/{id}:
 *   delete:
 *     summary: Remove/Unlink a user from account
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User unlinked successfully
 */

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   description: Authenticated user (without sensitive fields)
 */

/**
 * @swagger
 * /api/v1/user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/validate-token:
 *   post:
 *     summary: Validate access token
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: true
 *                     user:
 *                       type: object
 *                       description: Decoded user for the token
 *                 - type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                       example: false
 */

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     summary: Logout user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/change-password:
 *   post:
 *     summary: Change password
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/activate-account:
 *   post:
 *     summary: Activate account
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - activationCode
 *             properties:
 *               email:
 *                 type: string
 *               activationCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   description: Activated user (without sensitive fields)
 */

/**
 * @swagger
 * /api/v1/user/resend-activation-code:
 *   post:
 *     summary: Resend activation code
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Activation code resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 activationCode:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password code generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/resend-reset-password-code:
 *   post:
 *     summary: Resend reset password code
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset password code resent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resetPasswordCode:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/user/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - resetPasswordCode
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *               resetPasswordCode:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

