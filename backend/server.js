import 'dotenv/config';
import app from './src/app.js';
import { connectDatabase } from './src/config/database.js';
import { validateSecurityConfig } from './src/config/security.js';

const port = Number(process.env.PORT) || 5000;

try {
    validateSecurityConfig();
    await connectDatabase();
    app.listen(port, () => console.log(`BlogSphere API listening on port ${port}`));
} catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exitCode = 1;
}
