with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and fix lines around 1188-1194
for i in range(len(lines)):
    line = lines[i].rstrip()
    # Find the line with ");" after </> (the return statement close)
    if line.strip() == ');' and i > 1185:
        # Check next lines
        if i+1 < len(lines) and '</div>' in lines[i+1]:
            # Replace the sequence
            old_seq = ''.join(lines[i:i+5])
            new_seq = '''                    );
                  })()}
                </div>
'''
            if old_seq in ''.join(lines):
                content = ''.join(lines)
                content = content.replace(old_seq, new_seq)
                with open('src/App.tsx', 'w', encoding='utf-8') as f:
                    f.write(content)
                print('SUCCESS: Fixed IIFE and div closing sequence')
                break
            else:
                print('Could not find exact sequence')
                print(repr(old_seq[:200]))
        break
