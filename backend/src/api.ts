// Handler function type definition
type Handler = (event: any, context: any) => Promise<{
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}>;

const handler: Handler = async (event, context) => {
  console.log('ServerStatus function called:', event.path);
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Server status check with comprehensive health information
    const serverStatus = {
      status: 'ONLINE',
      timestamp: new Date().toISOString(),
      server: 'Brazucas em Cork - Express Server',
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external
      },
      configuration: {
        nodeVersion: process.version,
        platform: process.platform,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      services: {
        database: checkDatabaseConnection(),
        authentication: checkAuthConfiguration(),
        environment: checkEnvironmentVariables()
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(serverStatus, null, 2),
    };

  } catch (error) {
    console.error('ServerStatus error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Server Status Check Failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

// Helper functions to check server configuration
function checkDatabaseConnection() {
  const mongoUri = process.env.MONGODB_URI;
  return {
    configured: !!mongoUri,
    connected: false, // Would need actual connection test
    uri_present: !!mongoUri,
    status: mongoUri ? 'CONFIGURED' : 'MISSING_URI'
  };
}

function checkAuthConfiguration() {
  const jwtSecret = process.env.JWT_SECRET;
  const sessionSecret = process.env.SESSION_SECRET;
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  
  return {
    jwt_configured: !!jwtSecret,
    session_configured: !!sessionSecret,
    admin_configured: !!adminSecret,
    status: (jwtSecret && sessionSecret && adminSecret) ? 'CONFIGURED' : 'INCOMPLETE'
  };
}

function checkEnvironmentVariables() {
  const required = [
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ADMIN_SECRET_KEY',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'JWT_EXPIRES_IN'
  ];
  
  const missing = required.filter(env => !process.env[env]);
  const present = required.filter(env => !!process.env[env]);
  
  return {
    total_required: required.length,
    configured: present.length,
    missing_count: missing.length,
    missing_variables: missing,
    present_variables: present,
    status: missing.length === 0 ? 'COMPLETE' : 'INCOMPLETE'
  };
}

export { handler };
