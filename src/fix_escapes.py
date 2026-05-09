with open('App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix escaped template literals from the JS template literal extraction
content = content.replace('\\`', '`')
content = content.replace('\\${', '${')

with open('App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed escapes!')
print('\\` -> `')
print('\\${ -> ${')
