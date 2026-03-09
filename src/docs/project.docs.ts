/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - propertyId
 *               - minBudget
 *               - maxBudget
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               propertyId:
 *                 type: string
 *                 description: ID of the selected property
 *               minBudget:
 *                 type: number
 *               maxBudget:
 *                 type: number
 *               durationDays:
 *                 type: number
 *               durationRange:
 *                 type: string
 *                 description: JSON string of duration range object
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, published, in_progress, completed, cancelled]
 *               projectImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               projectDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects with pagination and filters
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title, property type, or owner name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, in_progress, completed, cancelled]
 *       - in: query
 *         name: riskLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *       - in: query
 *         name: minBudget
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBudget
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         pages:
 *                           type: number
 *                         limit:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   get:
 *     summary: Get a single project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   patch:
 *     summary: Update a project (only draft or published status)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               propertyId:
 *                 type: string
 *                 description: ID of the selected property
 *               minBudget:
 *                 type: number
 *               maxBudget:
 *                 type: number
 *               durationDays:
 *                 type: number
 *               durationRange:
 *                 type: string
 *                 description: JSON string of duration range object
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [draft, published, in_progress, completed, cancelled]
 *               projectImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               projectDocuments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Can only update own projects or projects not in draft/published status
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/v1/projects/{id}/suggest-contractors:
 *   get:
 *     summary: Get contractor suggestions for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contractors suggested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       contractor:
 *                         type: object
 *                       matchPercentage:
 *                         type: number
 *                         description: Match percentage based on services, location, verification, ratings
 *                       riskFactor:
 *                         type: number
 *                         description: Calculated risk factor score
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (invalid ID or fetching failure)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user can only view suggestions for their own projects)
 *       404:
 *         description: Project not found
 */

/**
 * @swagger
 * /api/v1/projects/{id}/invite-contractor:
 *   post:
 *     summary: Invite a contractor to bid on a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contractorId
 *             properties:
 *               contractorId:
 *                 type: string
 *                 description: ID of the contractor to invite
 *     responses:
 *       200:
 *         description: Contractor invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (invalid ID or contractor already invited)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (user can only invite contractors to their own projects)
 *       404:
 *         description: Project not found
 */
