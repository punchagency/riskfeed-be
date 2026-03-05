import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';
import CONFIG from './config';

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'RiskFeed Server API',
        version: '1.0.0',
        description: '',
        contact: {
            name: 'API Support',
            email: 'support@riskfeed.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: CONFIG.appUrl,
            description: `${CONFIG.nodeEnv} server`,
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token',
            },
        },
    },
    tags: [
        {
            name: 'User',
            description: 'User authentication and account management',
        },
        {
            name: 'Projects',
            description: 'Project management for homeowners',
        },
        {
            name: 'Properties',
            description: 'Property management',
        },
    ],
};

const options: swaggerJsdoc.Options = {
    swaggerDefinition,
    apis: [
        './src/docs/*.ts',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;