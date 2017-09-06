#!/bin/bash

bail() {
	echo 'Error executing command, exiting'
	exit 1
}

exec_cmd_nobail() {
	echo "+ $1"
	bash -c "$1"
}

exec_cmd() {
	exec_cmd_nobail "$1" || bail
}

SELINUX=disabled

usermod --password $(echo root | openssl passwd -1 -stdin) root

folderNginx=/var/nginxConfigTool
repoNginx=https://github.com/ricardoSa84/nginxConfigTool

exec_cmd "rm -rf $folderNginx"

# If system redhat
if [ -f /etc/redhat-release ]; then

	distro=$(sed -n 's/^distroverpkg=//p' /etc/yum.conf)
	releasever=$(rpm -q --qf "%{version}" -f /etc/$distro)
	basearch=$(rpm -q --qf "%{arch}" -f /etc/$distro)

	exec_cmd "echo '[nginx]' > /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'name=nginx repo' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'baseurl=http://nginx.org/packages/centos/$releasever/$basearch/' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'gpgcheck=0' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'enabled=1' >> /etc/yum.repos.d/nginx.repo"

	exec_cmd "echo '[mongodb-org-3.2]' > /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'name=MongoDB Repository' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.2/x86_64/' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgcheck=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'enabled=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc' >> /etc/yum.repos.d/mongodb-org.repo"

	exec_cmd "yum repolist"

	exec_cmd "curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -"
	exec_cmd "yum install -y nodejs nginx git mongodb-org net-tools nano"

	exec_cmd "chkconfig nginx on"

	exec_cmd "systemctl start mongod || systemctl reload mongod"

#fi
# if system debian
elif [ -f /etc/lsb-release ]; then
	DISTRO=$(lsb_release -c -s)

	check_alt() {
		if [ "X${DISTRO}" == "X${2}" ]; then
			echo
			echo "## You seem to be using ${1} version ${DISTRO}."
			echo "## This maps to ${3} \"${4}\"... Adjusting for you..."
			DISTRO="${4}"
		fi
	}
	exec_cmd "apt-get install curl -y"

	exec_cmd "wget https://nginx.org/keys/nginx_signing.key -O - | apt-key add -"
	exec_cmd "echo 'deb http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' | tee /etc/apt/sources.list.d/nginx.list"
	exec_cmd "echo 'deb-src http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' | tee /etc/apt/sources.list.d/nginx.list"

	exec_cmd "apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927"
	exec_cmd "echo 'deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse' | tee /etc/apt/sources.list.d/mongodb-org-3.2.list"

	exec_cmd "curl -sL https://deb.nodesource.com/setup_8.x | -E bash -"
	exec_cmd "apt-get install -y nodejs nginx git"

	exec_cmd "update-rc.d nginx defaults"
fi

exec_cmd "mkdir -p $folderNginx"

exec_cmd "git clone $repoNginx"

exec_cmd "cd $folderNginx && npm install"
exec_cmd "cd $folderNginx && npm install opennebula"

# cd
# exec_cmd "mv -f $folderNginx/FilesMove/dashboard /etc/nginx/ || cp -f $folderNginx/FilesMove/dashboard/* /etc/nginx/dashboard/ || true"
# exec_cmd "cp $folderNginx/FilesMove/conf.d/* /etc/nginx/conf.d/ || true"

exec_cmd "mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.back"

# If system redhat
if [ -f /etc/redhat-release ]; then
	exec_cmd "cp $folderNginx/FilesMove/nginx/redhat/nginx.conf /etc/nginx/ || true"
# if system debian
elif [ -f /etc/lsb-release ]; then
	exec_cmd "cp $folderNginx/FilesMove/nginx/debian/nginx.conf /etc/nginx/ || true"
fi

exec_cmd "rm -rf $folderNginx/FilesMove || true"

exec_cmd "npm install pm2 -g"

exec_cmd "echo 'module.exports = {' > $folderNginx/collectorServer.js"
exec_cmd "echo '    collectorServer: "[IPSTATION]"' >> $folderNginx/collectorServer.js"
exec_cmd "echo '}' >> $folderNginx/nginxConfigTool/collectorServer.js"

exec_cmd "cd $folderNginx/ && pm2 start startcollector.js --name 'nginxCollector' || true"
exec_cmd "pm2 save || true"
exec_cmd "pm2 startup systemd || true"

exec_cmd "service nginx restart || service nginx start"

exit 0