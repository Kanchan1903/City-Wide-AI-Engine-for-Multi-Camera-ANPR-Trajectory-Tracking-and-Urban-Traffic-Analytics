import sys

todo_file = sys.argv[1]
with open(todo_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('pick'):
        new_lines.append(line.replace('pick', 'reword', 1))
    else:
        new_lines.append(line)

with open(todo_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
