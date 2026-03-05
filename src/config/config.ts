import "dotenv/config";

const CONFIG = {
	appBasePath: __dirname + "/../",
	nodeEnv: process.env.NODE_ENV || 'development',
	settings: {
		SAVE_LOG_INTERVAL: 5, // minutes
		MAX_LOG_STACK: 10,
		PAGINATION_LIMIT: 30,
		REMEMBER_ME_DAYS: 360,//No of days to remain logged in on a device after last visit
		RECONFIRM_DEVICE_MINUTES: 5,
		ENABLE_EMAIL: true,
		MIN_WITHDRAWAL_LIMIT: 1000,
		VERIFICATION_CODE_EXPIRATION_DURATION: 10,
	},
	redis: {
		enabled: process.env.REDIS_ENABLED !== 'false', // Default to true, set REDIS_ENABLED=false to disable
		host: process.env.REDIS_HOST || 'localhost',
		port: parseInt(process.env.REDIS_PORT || '6379'),
		password: process.env.REDIS_PASSWORD,
		db: parseInt(process.env.REDIS_DB || '0'),
		maxRetriesPerRequest: 3,
		lazyConnect: true,
		keyPrefix: process.env.REDIS_KEY_PREFIX || 'riskfeed:',
		defaultTTL: 3600,
		cacheTTL: {
			user: 1800,        // 30 minutes
			session: 3600,     // 1 hour
			query: 300,        // 5 minutes
			static: 86400,     // 24 hours
			temp: 60,          // 1 minute
			shortQuery: 60,    // 1 minute
			analytics: 3600,   // 1 hour
		}
	},
	links: {
		frontend: process.env.FRONTEND_URL || "http://localhost:5173",
	},
	corsOrigins: [
		'http://localhost:3000',
		'http://localhost:3001',
		'http://localhost:5173',
		'http://localhost:5174',
		'http://localhost',
		'https://riskfeed.com',
		'https://www.riskfeed.com',
		process.env.FRONTEND_URL
	].filter((origin): origin is string => typeof origin === 'string'),
	appUrl: process.env.APP_URL || 'http://localhost:7000',
	ACCESS_SECRET: process.env.ACCESS_TOKEN || '50e2e1bd3f1a52a-db9f-40ed-8c6d-f343a91f09fd2ab09',
	REFRESH_SECRET: process.env.REFRESH_TOKEN || '773ef705fa027-37ef-4f3f-b82b-782a26d6634b204fcc0e6d',
	accessTokenJwtExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '1h',
	refreshTokenJwtExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};

export default CONFIG;
