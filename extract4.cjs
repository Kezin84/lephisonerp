const fs = require('fs');
const log = fs.readFileSync('C:\\Users\\admin\\.gemini\\antigravity\\brain\\142fe706-ba7a-4bb2-91f6-de49d594a124\\.system_generated\\logs\\overview.txt', 'utf8');
const lines = log.split('\n').filter(Boolean);
const tools = new Set();
for (let i = lines.length - 1; i >= 0; i--) {
    try {
        const entry = JSON.parse(lines[i]);
        if (entry.source === 'TOOL' && entry.tool_responses) {
            for (const resp of entry.tool_responses) {
                tools.add(resp.name);
            }
        }
    } catch(e) {}
}
console.log(Array.from(tools));
