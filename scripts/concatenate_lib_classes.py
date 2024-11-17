import glob
import os

script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_folder = os.path.join(script_dir, 'src')
test_folder = os.path.join(script_dir, 'tests')
output_file = os.path.join(script_dir, 'classes.txt')

with open(output_file, 'w') as outfile:
    for filepath in glob.glob(os.path.join(source_folder, '*.ts')):
        with open(filepath, 'r') as infile:
            outfile.write(infile.read())
            outfile.write('\n')

with open(output_file, 'a') as outfile:
    for filepath in glob.glob(os.path.join(test_folder, '*.ts')):
        with open(filepath, 'r') as infile:
            outfile.write(infile.read())
            outfile.write('\n')