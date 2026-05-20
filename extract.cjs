const fs = require('fs');
const log = fs.readFileSync('C:\\Users\\admin\\.gemini\\antigravity\\brain\\142fe706-ba7a-4bb2-91f6-de49d594a124\\.system_generated\\logs\\overview.txt', 'utf8');
const lines = log.split('\n').filter(Boolean);
for (let i = lines.length - 1; i >= 0; i--) {
    try {
        const entry = JSON.parse(lines[i]);
        if (entry.tool_calls) {
            for (const call of entry.tool_calls) {
                if (call.name === 'view_file' || call.name === 'multi_replace_file_content' || call.name === 'replace_file_content') {
                    console.log('Found tool call:', call.name);
                    fs.writeFileSync('last_tool_call.json', JSON.stringify(call, null, 2));
                    process.exit(0);
                }
            }
        }
        if (entry.tool_responses) {
            for (const resp of entry.tool_responses) {
                if (resp.name === 'view_file' || resp.name === 'multi_replace_file_content') {
                    if (resp.response && resp.response.output && resp.response.output.includes('dl-ma-hd')) {
                        fs.writeFileSync('last_tool_resp.txt', resp.response.output);
                        console.log('Found tool response with dl-ma-hd');
                        process.exit(0);
                    }
                }
            }
        }
    } catch(e) {}
}
