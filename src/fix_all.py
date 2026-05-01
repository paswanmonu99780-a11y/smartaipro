with open('src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and print lines around the problem area
for i, line in enumerate(lines[1160:1220], start=1161):
    print(f"{i}: {line.rstrip()}")
