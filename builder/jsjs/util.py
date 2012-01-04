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
    import os

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
    print("Running command:\n === " + " ".join(command))
    subprocess.call(command, **kwargs)

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
