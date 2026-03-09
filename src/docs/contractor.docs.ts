/**
 * @swagger
 * components:
 *   schemas:
 *     Contractor:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         companyName:
 *           type: string
 *         businessName:
 *           type: string
 *         licenseNumber:
 *           type: string
 *         yearsInBusiness:
 *           type: number
 *         businessEmail:
 *           type: string
 *         businessPhone:
 *           type: string
 *         businessWebsite:
 *           type: string
 *         businessAddress:
 *           type: object
 *           properties:
 *             street:
 *               type: string
 *             zipcode:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *         services:
 *           type: array
 *           items:
 *             type: string
 *         serviceAreas:
 *           type: array
 *           items:
 *             type: string
 *         teamSize:
 *           type: string
 *         riskScore:
 *           type: number
 *         activeProjects:
 *           type: number
 *         completedProjects:
 *           type: number
 *         averageBudget:
 *           type: number
 *         ratings:
 *           type: object
 *           properties:
 *             averageRatings:
 *               type: number
 *             totalRatings:
 *               type: number
 *         verification:
 *           type: object
 *           properties:
 *             businessVerificationStatus:
 *               type: string
 *             licenseValidationStatus:
 *               type: string
 *             insuranceCheckStatus:
 *               type: string
 *             backgroundScreeningStatus:
 *               type: string
 *             financialHealthStatus:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/contractor:
 *   get:
 *     summary: Find contractors with filtering and search
 *     tags: [Contractor]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by company name or business name
 *       - in: query
 *         name: speciality
 *         schema:
 *           type: string
 *         description: Filter by speciality (project type)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by city, state, or service area
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *         description: Minimum average rating
 *       - in: query
 *         name: maxRiskScore
 *         schema:
 *           type: number
 *         description: Maximum risk score
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 30
 *     responses:
 *       200:
 *         description: Successfully retrieved contractors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Contractor'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     pages:
 *                       type: number
 *                     limit:
 *                       type: number
 *       500:
 *         description: Internal server error
 *
 * /api/v1/contractor/{id}:
 *   get:
 *     summary: Get contractor details by ID
 *     tags: [Contractor]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Contractor ID
 *     responses:
 *       200:
 *         description: Successfully retrieved contractor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Contractor'
 *       404:
 *         description: Contractor not found
 *       500:
 *         description: Internal server error
 */
