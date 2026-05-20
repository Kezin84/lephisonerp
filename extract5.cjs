const fs = require('fs');
const log = fs.readFileSync('C:\\Users\\admin\\.gemini\\antigravity\\brain\\142fe706-ba7a-4bb2-91f6-de49d594a124\\.system_generated\\logs\\overview.txt', 'utf8');
const lines = log.split('\n').filter(Boolean);
let c = 0;
for (let i = lines.length - 1; i >= 0; i--) {
    try {
        const entry = JSON.parse(lines[i]);
        if (entry.source === 'TOOL') {
            fs.writeFileSync('tool_' + c + '.json', JSON.stringify(entry, null, 2));
            c++;
            if (c > 5) break;
        }
    } catch(e) {}
}
