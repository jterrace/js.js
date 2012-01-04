import fileinput
import sys

def filter_file(infile, filter_func):
    """Opens a text file, calls a filter function on each line
    and then saves the result back to the file.
    
      :param infile: The input file
      :param filter_func: A function that takes a single argument, the text of a line
    """
    for line in fileinput.input(infile, inplace=1, mode="r"):
        sys.stdout.write(filter_func(line))
