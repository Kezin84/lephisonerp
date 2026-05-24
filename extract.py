import sys

with open('diff_backup.txt', 'r', encoding='utf-16le') as f:
    lines = f.readlines()

hunks = []
current_hunk = []
in_diff = False

for line in lines:
    if line.startswith('diff --git'):
        in_diff = True
        current_hunk.append(line)
        continue
    
    if in_diff:
        if line.startswith('@@'):
            if current_hunk and not current_hunk[-1].startswith('+++') and not current_hunk[-1].startswith('---'):
                hunks.append(current_hunk)
                current_hunk = []
        current_hunk.append(line)

hunks.append(current_hunk)

# Hunks are:
# hunks[0] is header + hunk 1
# hunks[1] is hunk 2
# ...
# We want to keep hunks 0 to 9 (which is header + first 10 hunks).
with open('clean.patch', 'w', encoding='utf8') as f:
    for hunk in hunks[:10]:
        for line in hunk:
            f.write(line)
