import os
import subprocess

def is_exe(fpath):
    """Returns True if the given path is executable"""
    return os.path.exists(fpath) and os.access(fpath, os.X_OK)

def which(program):
    """Mimics the unix command ``which``. Taken from:
     http://stackoverflow.com/a/377028/624900
      
      :param program: A name of a command or an absolute path
    """

    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file

    return None

def abspath_join(*args):
    """Joins multiple paths together and returns the absolute path"""
    return os.path.abspath(os.path.join(*args))

def run_command(command, **kwargs):
    """Runs the given command."""
    added_env = kwargs.pop('added_env', {})
    if len(added_env) > 0:
        env = kwargs.pop('env', {})
        print("Added environment variables for command:")
        print("  -- " + "\n  -- ".join("%s=%s" % (k,v) for k,v in (env.items() + added_env.items())))
        env = dict(env.items() + added_env.items() + os.environ.items())
        kwargs['env'] = env
    print("Running command:\n === " + " ".join(command))
    return subprocess.call(command, **kwargs)

def hg_clone(url, dest, tag=None):
    """Clones a mercurial repository
    
      :param url: URL of the repo
      :param dest: Destination directory on disk
      :param tag: Mercurial tag to check out (optional)
    """
    command = ["hg", "clone", url]
    if tag is not None:
        command.append("-u")
        command.append(tag)
    command.append(dest)
    run_command(command)

def svn_co(url, dest):
    """Checks out a Subversion repository
    
      :param url: URL of subversion repo
    """
    command = ["svn", "checkout", url, dest]
    run_command(command)

def mkdir(path, ensure=True):
    """Creates the given directory path if it doesn't exist. Raises
       OSError if ensure is True and the directory creation failed.
    
      :param path: the path to create
      :param ensure: ensure the directory is created
    """
    try:
        os.mkdir(path)
        print("Created directory: '%s'" % path)
    except OSError:
        pass
    
    if ensure and not os.path.isdir(path):
        raise OSError("Failed to create the directory '%s'." % path)

def tail( f, window=20 ):
    """Unix tail for python
    Taken from http://stackoverflow.com/a/136368/624900
    """
    BUFSIZ = 1024
    f.seek(0, 2)
    bytes = f.tell()
    size = window
    block = -1
    data = []
    while size > 0 and bytes > 0:
        if (bytes - BUFSIZ > 0):
            # Seek back one whole BUFSIZ
            f.seek(block*BUFSIZ, 2)
            # read BUFFER
            data.append(f.read(BUFSIZ))
        else:
            # file too small, start from begining
            f.seek(0,0)
            # only read what was not read
            data.append(f.read(bytes))
        linesFound = data[-1].count('\n')
        size -= linesFound
        bytes -= BUFSIZ
        block -= 1
    return '\n'.join(''.join(data).splitlines()[-window:])
