with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix 1: Line 1162 - add closing </div> for Referral Code card after inner flex
# Line 1162 is index 1161 (0-based), currently: "                          </div>"
# We need to add "                        </div>" after it

# Fix 2: Line 1174 - add closing </div> for Referral Link card after inner flex  
# Line 1174 is index 1173

# Fix 3: Line 1178 - add closing </div> for Credits Earned card
# Line 1178 is index 1177, currently: "                            <div className..."

# Fix 4: Line 1181 - add closing </div> for Per Referral card
# Line 1181 is index 1180, currently: "                            <div className..."

# Fix 5: Line 1186 - change ");" to "</>" then add ");" on next line

# Let's do this by finding the exact patterns

# Fix missing closing divs after inner flex containers
for i, line in enumerate(lines):
    # After Referral Code button flex closes
    if i == 1161 and '</div>' in line and 'button' not in line and 'Copied' not in line:
        lines.insert(i+1, '                        </div>\n')
        break

# Re-read since we modified
with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # After Referral Link button flex closes  
    if 'copiedLink' in line and i > 1170:
        # Find the next </div> which closes the flex
        for j in range(i, min(i+5, len(lines))):
            if '</div>' in lines[j] and j > i:
                lines.insert(j+1, '                        </div>\n')
                break
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # After Credits Earned text div
    if 'Credits Earned' in line:
        # Find next </div>
        for j in range(i, min(i+3, len(lines))):
            if '</div>' in lines[j]:
                lines.insert(j+1, '                          </div>\n')
                break
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # After Per Referral text div
    if 'Per Referral' in line:
        # Find next </div>
        for j in range(i, min(i+3, len(lines))):
            if '</div>' in lines[j]:
                lines.insert(j+1, '                          </div>\n')
                break
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    # Fix the ");" to "</>" + ");"
    if line.strip() == ');' and i > 1180:
        lines[i] = '                      </>\n'
        lines.insert(i+1, '                    );\n')
        break

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print('Fixed all JSX issues')
