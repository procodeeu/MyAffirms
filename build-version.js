
const fs = require('fs');
const now = new Date();
const buildTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

const versionContent = `
export const BUILD_VERSION = '${buildTime}';
export const BUILD_DATE = '${now.toISOString()}';
`;

fs.writeFileSync('./utils/version.js', versionContent);
