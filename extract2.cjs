const fs = require('fs');
const log = fs.readFileSync('C:\\Users\\admin\\.gemini\\antigravity\\brain\\142fe706-ba7a-4bb2-91f6-de49d594a124\\.system_generated\\logs\\overview.txt', 'utf8');
const lines = log.split('\n').filter(Boolean);
for (let i = lines.length - 1; i >= 0; i--) {
    try {
        const entry = JSON.parse(lines[i]);
        if (entry.source === 'TOOL' && entry.tool_responses) {
            for (const resp of entry.tool_responses) {
                if (resp.name === 'multi_replace_file_content' && resp.response && resp.response.output && resp.response.output.includes('dl-ma-hd')) {
                    fs.writeFileSync('last_diff.txt', resp.response.output);
                    console.log('Found diff!');
                    process.exit(0);
                }
            }
        }
        if (entry.source === 'MODEL' && entry.tool_calls) {
             for (const call of entry.tool_calls) {
                 if (call.name === 'multi_replace_file_content') {
                     // Check args
                     if (call.args && call.args.ReplacementChunks) {
                         fs.writeFileSync('last_chunks.json', JSON.stringify(call.args.ReplacementChunks, null, 2));
                     }
                 }
             }
        }
    } catch(e) {}
}
