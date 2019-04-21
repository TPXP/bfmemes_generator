#!/bin/bash

# 1. Fetch the file list
echo "** Fetching the directory list"
echo "ls -1" | sshpass -e sftp -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST | tee /tmp/folder_list

# 2. Find out what we want to do
echo "** Writing deployment commands"

## Delete old versions
LAST_MONTH=$(date --date='last month' +%s)
[[ -f /tmp/command_list ]] && rm /tmp/command_list
touch /tmp/command_list

cat /tmp/folder_list

N_PRESERVED=0

while read folder;do
	# Discard lines that are not number
	case $folder in
		''|*[!0-9]*) continue ;;
		# *) echo good ;;
	esac
	if [[ folder -lt LAST_MONTH ]]; then
		echo "rmdir $folder" >> /tmp/command_list
	else
		N_PRESERVED=$[N_PRESERVED + 1]
	fi
done < /tmp/folder_list

## If we remove every folder, keep the last one!
if [[ N_PRESERVED -lt 1 ]]; then
	sed \$d -i /tmp/command_list
	echo "* Keeping the last version even if it's older than a month"
fi

## Deploy our website
TARGET_DIR=$(date +%s)
echo "mkdir $TARGET_DIR" >> /tmp/command_list
echo "cd $TARGET_DIR"    >> /tmp/command_list

cd src
for file in *;do
	case $file in
		'') continue ;;
	esac
	echo "put $file" >> /tmp/command_list
done

## Change the symlinks
echo "cd .."                  >> /tmp/command_list
echo "rm live"                >> /tmp/command_list
echo "ln -s $TARGET_DIR live" >> /tmp/command_list

cat /tmp/command_list

echo "** Deploying!"
cat /tmp/command_list | sshpass -e sftp -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST
