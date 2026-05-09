with open('../fix-app.js', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('const content = `') + len('const content = `')
fs_pos = content.find('fs.writeFileSync')
end = content.rfind('`', start, fs_pos)

if start > 0 and end > start:
    code = content[start:end]
    with open('App.tsx', 'w', encoding='utf-8') as out:
        out.write(code)
    print('SUCCESS! Wrote', len(code), 'bytes to App.tsx')
else:
    print('FAIL! start=', start, 'end=', end, 'fs_pos=', fs_pos)

