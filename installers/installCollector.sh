#!/bin/bash

usermod --password $(echo root | openssl passwd -1 -stdin) root

SELINUX=disabled

folderNginx=/root/nginxConfigTool
repoNginx=https://github.com/ricardoSa84/nginxConfigTool

rm -rf $folderNginx

# If system redhat
if [ -f /etc/redhat-release ]; then

	distro=$(sed -n 's/^distroverpkg=//p' /etc/yum.conf)
	releasever=$(rpm -q --qf "%{version}" -f /etc/$distro)
	basearch=$(rpm -q --qf "%{arch}" -f /etc/$distro)

	echo "[nginx]" > /etc/yum.repos.d/nginx.repo
	echo "name=nginx repo" >> /etc/yum.repos.d/nginx.repo
	echo "baseurl=http://nginx.org/packages/centos/$releasever/$basearch/" >> /etc/yum.repos.d/nginx.repo
	echo "gpgcheck=0" >> /etc/yum.repos.d/nginx.repo
	echo "enabled=1" >> /etc/yum.repos.d/nginx.repo

	echo "[mongodb-org-3.2]" > /etc/yum.repos.d/mongodb-org.repo
	echo "name=MongoDB Repository" >> /etc/yum.repos.d/mongodb-org.repo
	echo "baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.2/x86_64/" >> /etc/yum.repos.d/mongodb-org.repo
	echo "gpgcheck=1" >> /etc/yum.repos.d/mongodb-org.repo
	echo "enabled=1" >> /etc/yum.repos.d/mongodb-org.repo
	echo "gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc" >> /etc/yum.repos.d/mongodb-org.repo

	yum repolist

	curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -

	yum install -y nodejs nginx git mongodb-org net-tools nano

	chkconfig nginx on

	systemctl start mongod || systemctl reload mongod

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

	apt-get install curl -y

	wget https://nginx.org/keys/nginx_signing.key -O - | apt-key add -
	echo "deb http://nginx.org/packages/ubuntu/ ${DISTRO} nginx" > /etc/apt/sources.list.d/nginx.list
	echo "deb-src http://nginx.org/packages/ubuntu/ ${DISTRO} nginx" >> /etc/apt/sources.list.d/nginx.list

	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
	echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

	apt-get install -y nodejs nginx git

	update-rc.d nginx defaults
fi

mkdir -p $folderNginx

git clone $repoNginx  $folderNginx

cd $folderNginx && npm install
cd $folderNginx && npm install opennebula

mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.back

# If system redhat
if [ -f /etc/redhat-release ]; then
	cp $folderNginx/FilesMove/nginx/redhat/nginx.conf /etc/nginx/ || true
# if system debian
elif [ -f /etc/lsb-release ]; then
	cp $folderNginx/FilesMove/nginx/debian/nginx.conf /etc/nginx/ || true
fi

echo 'module.exports = {
    collectorServer: "[IPSTATION]"
}' > $folderNginx/collectorServer.js

echo "[Unit]
Description=nginxCollector - To a simple management

[Service]
User=root
Group=root
ExecStart=/usr/bin/node $folderNginx/startcollector.js
WorkingDirectory=$folderNginx
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nginxConfigTool
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/nginxCollector.service

systemctl enable nginxCollector.service
systemctl start nginxCollector.service

service nginx restart || service nginx start

exit 0