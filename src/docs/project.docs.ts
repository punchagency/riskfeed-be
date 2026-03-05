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
 *               - property
 *               - minBudget
 *               - maxBudget
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               property:
 *                 type: string
 *                 description: JSON string of property object
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
 *               milestones:
 *                 type: string
 *                 description: JSON string array of milestones
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               propertyDocuments:
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
 *               property:
 *                 type: string
 *                 description: JSON string of property object
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
 *               milestones:
 *                 type: string
 *                 description: JSON string array of milestones
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 10
 *               propertyDocuments:
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
