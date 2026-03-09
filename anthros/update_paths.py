import os
import glob
import re

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    new_content = content

    # Use regex to replace exact occurrences that DON'T have ../ before them
    patterns = [
        (r'(href=")(style.css")', r'\1../\2'),
        (r'(href=")(core/)', r'\1../\2'),
        (r'(src=")(core/)', r'\1../\2'),
        (r'(src=")(assets/)', r'\1../\2'),
        (r'(href=")(assets/)', r'\1../\2'),
        (r'(url\(\')(assets/)', r'\1../\2'),
        (r'(url\(")(assets/)', r'\1../\2'),
    ]

    for pattern, repl in patterns:
        new_content = re.sub(pattern, repl, new_content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# We will run this on templates
for f in glob.glob('/Users/elnegro/Antigravity-Agency/PROJECTS/Anthros/src/templates/*.html'):
    replace_in_file(f)

# On components
for f in glob.glob('/Users/elnegro/Antigravity-Agency/PROJECTS/Anthros/components/*.html'):
    replace_in_file(f)

# And on builds/
for f in glob.glob('/Users/elnegro/Antigravity-Agency/PROJECTS/Anthros/builds/*.html'):
    replace_in_file(f)

print("Done updating paths.")
