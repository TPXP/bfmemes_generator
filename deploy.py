import paramiko
import os
import time

hostname = os.environ['DEPLOY_HOST']
username = os.environ['DEPLOY_USER']
password = os.environ['DEPLOY_PASSWORD']
path = os.environ['DEPLOY_PATH']

date_format = '%Y-%m-%d %H:%M:%S'
# Make sure the path ends with a slash
if path[-1] != '/':
    print('WARN: DEPLOY_PATH does not end with a slash, adding it')
    path = path + '/'

# Create the SFTP client
print('* Connecting to the server...')

# Inspired by https://github.com/paramiko/paramiko/blob/master/demos/demo_sftp.py
t = paramiko.Transport((hostname, 22))
t.connect(
    None,
    username,
    password
)
sftp = paramiko.SFTPClient.from_transport(t)

# List all versions present
print('* Listing all versions on the server')
versions = sftp.listdir(path)

deletion_threshold = time.gmtime(time.time() - 31*3600*24)
to_delete = []
prev_version_preserved = False

for version in versions:
    try:
        date = time.strptime(version, '%Y-%m-%d %H:%M:%S')
        if date < deletion_threshold:
            to_delete.append(version)
        else:
            prev_version_preserved = True
    except ValueError:
        pass


if not prev_version_preserved and len(to_delete) > 0:
    to_delete.sort()
    to_delete.pop()

print('* Deleting old versions')
for directory in to_delete:
    print(directory)
    directory = path + directory
    # We don't deploy sub directories
    for file in sftp.listdir(directory):
        sftp.remove(directory + '/' + file)
    # Now that the directory is cleaned, remove it
    sftp.rmdir(directory)

cur_ver = time.strftime(date_format)
print('* Sending the current version "{}"'.format(cur_ver))

remote_path = path + cur_ver
sftp.mkdir(remote_path)
for file in os.listdir('dist'):
    print(file)
    sftp.put(os.curdir + '/dist/' + file, remote_path + '/' + file)

print('* Changing the "latest" symlink')
try:
    sftp.remove(path + 'latest')
except:
    pass
sftp.symlink(remote_path, path + 'latest')

print('All done!')