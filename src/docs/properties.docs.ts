/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - propertyType
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [single_family_home, townhouse, condominium, multi-family, investment_property, vacation_home, commercial_property, land/lot]
 *               status:
 *                 type: string
 *                 enum: [active, sold, archived, lease, rented]
 *               address:
 *                 type: object
 *                 required:
 *                   - street
 *                   - city
 *                   - state
 *                   - zipCode
 *                   - country
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country:
 *                     type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *               estimatedValue:
 *                 type: number
 *               currentEstimatedValue:
 *                 type: number
 *               annualPropertyTax:
 *                 type: number
 *               annualInsurance:
 *                 type: number
 *               annualMaintenanceCosts:
 *                 type: number
 *               squareFeet:
 *                 type: number
 *               yearBuilt:
 *                 type: number
 *               noOfBedrooms:
 *                 type: number
 *               noOfBathrooms:
 *                 type: number
 *               lotSize:
 *                 type: string
 *               notes:
 *                 type: string
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
 
/**
 * @swagger
 * /api/v1/properties/analytics:
 *   get:
 *     summary: Get property portfolio analytics
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
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
 *                     portfolioValue:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         progression:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                               value:
 *                                 type: number
 *                     propertySummary:
 *                       type: object
 *                       properties:
 *                         totalProperties:
 *                           type: number
 *                         activeProjectsCount:
 *                           type: number
 *                     distributionByType:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           count:
 *                             type: number
 *                           value:
 *                             type: number
 *                     financialHealth:
 *                       type: object
 *                       properties:
 *                         totalAnnualCosts:
 *                           type: number
 *                         totalEquity:
 *                           type: number
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, archived, lease, rented]
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [single_family_home, townhouse, condominium, multi-family, investment_property, vacation_home, commercial_property, land/lot]
 *     responses:
 *       200:
 *         description: Properties retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get property by ID
 *     tags: [Properties]
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
 *         description: Property retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   patch:
 *     summary: Update property
 *     tags: [Properties]
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
 *               name:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [single_family_home, townhouse, condominium, multi-family, investment_property, vacation_home, commercial_property, land/lot]
 *               status:
 *                 type: string
 *                 enum: [active, sold, archived, lease, rented]
 *               address:
 *                 type: object
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *               purchasePrice:
 *                 type: number
 *               estimatedValue:
 *                 type: number
 *               currentEstimatedValue:
 *                 type: number
 *               annualPropertyTax:
 *                 type: number
 *               annualInsurance:
 *                 type: number
 *               annualMaintenanceCosts:
 *                 type: number
 *               squareFeet:
 *                 type: number
 *               yearBuilt:
 *                 type: number
 *               noOfBedrooms:
 *                 type: number
 *               noOfBathrooms:
 *                 type: number
 *               lotSize:
 *                 type: string
 *               notes:
 *                 type: string
 *               imagesToRemove:
 *                 type: array
 *                 items:
 *                   type: string
 *               propertyImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     summary: Delete property
 *     tags: [Properties]
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
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Property not found
 */
