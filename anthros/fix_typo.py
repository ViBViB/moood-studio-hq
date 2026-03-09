import re

with open('style.css', 'r') as f:
    css = f.read()

# H2 and Similar (64px, 56px, 42px)
css = re.sub(r'font-size:\s*(64|56|42)px;', r'font-size: var(--brand-h2-size);', css)

# H3 and Similar (48px, 40px)
css = re.sub(r'font-size:\s*(48|40)px;', r'font-size: var(--brand-h3-size);', css)

# H4 and Similar (31px, 30px)
css = re.sub(r'font-size:\s*(31|30)px;', r'font-size: var(--brand-h4-size);', css)

# Body Large (24px, 20px)
css = re.sub(r'font-size:\s*(24|20)px;', r'font-size: var(--brand-body-l-size);', css)

# Body Standard (18px)
css = re.sub(r'font-size:\s*18px;', r'font-size: var(--brand-body-std-size);', css)

# Body Small (16px)
css = re.sub(r'font-size:\s*16px;', r'font-size: var(--brand-body-small-size);', css)

with open('style.css', 'w') as f:
    f.write(css)

print("Typography variables injected successfully!")
