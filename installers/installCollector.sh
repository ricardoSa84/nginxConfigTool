#!/bin/bash

SELINUX=disabled

echo "Start Script" > /root/log.log

usermod --password $(echo root | openssl passwd -1 -stdin) root

# cd
# folderNginx=$(pwd)/nginxConfigTool
folderNginx=/opt/nginxConfigTool
nginxToolRep=https://github.com/ricardoSa84/nginxConfigTool


# If system redhat
if [ -f /etc/redhat-release ]; then

	distro=$(sed -n 's/^distroverpkg=//p' /etc/yum.conf)
	releasever=$(rpm -q --qf "%{version}" -f /etc/$distro)
	basearch=$(rpm -q --qf "%{arch}" -f /etc/$distro)

	echo '[nginx]' > /etc/yum.repos.d/nginx.repo
	echo 'name=nginx repo' >> /etc/yum.repos.d/nginx.repo
	echo 'baseurl=http://nginx.org/packages/centos/$releasever/$basearch/' >> /etc/yum.repos.d/nginx.repo
	echo 'gpgcheck=0' >> /etc/yum.repos.d/nginx.repo
	echo 'enabled=1' >> /etc/yum.repos.d/nginx.repo

	echo '[mongodb-org-3.2]' > /etc/yum.repos.d/mongodb-org.repo
	echo 'name=MongoDB Repository' >> /etc/yum.repos.d/mongodb-org.repo
	echo 'baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.2/x86_64/' >> /etc/yum.repos.d/mongodb-org.repo
	echo 'gpgcheck=1' >> /etc/yum.repos.d/mongodb-org.repo
	echo 'enabled=1' >> /etc/yum.repos.d/mongodb-org.repo
	echo 'gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc' >> /etc/yum.repos.d/mongodb-org.repo

	yum repolist

	curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
	yum install -y nodejs nginx git mongodb-org net-tools nano

	chkconfig nginx on

	systemctl start mongod || systemctl reload mongod

	echo "Fim If Red Hat" >> /root/log.log
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
	echo 'deb http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' | tee /etc/apt/sources.list.d/nginx.list
	echo 'deb-src http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' | tee /etc/apt/sources.list.d/nginx.list

	apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
	echo 'deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse' | tee /etc/apt/sources.list.d/mongodb-org-3.2.list

	curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
	apt-get install -y nodejs nginx git

	update-rc.d nginx defaults
fi

rm -rf $folderNginx

echo "$nginxToolRep $folderNginx" >> /root/log.log

git clone $nginxToolRep $folderNginx

echo "Inicio install modules" >> /root/log.log

cd $folderNginx && npm install
cd $folderNginx && npm install opennebula

echo "Fim install modules" >> /root/log.log

# cd
# mv -f $folderNginx/FilesMove/dashboard /etc/nginx/ || cp -f $folderNginx/FilesMove/dashboard/* /etc/nginx/dashboard/ || true
# cp $folderNginx/FilesMove/conf.d/* /etc/nginx/conf.d/ || true

echo "Backup nginx.conf" >> /root/log.log

mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.back

echo "Copy new file" >> /root/log.log
# If system redhat
if [ -f /etc/redhat-release ]; then
	cp $folderNginx/FilesMove/nginx/redhat/nginx.conf /etc/nginx/ || true
# if system debian
elif [ -f /etc/lsb-release ]; then
	cp $folderNginx/FilesMove/nginx/debian/nginx.conf /etc/nginx/ || true
fi

# rm -rf $folderNginx/FilesMove || true


echo "Create new file collector" >> /root/log.log

# cp $folderNginx/collectorServer.js.example $folderNginx/collectorServer.js
echo 'module.exports = {' > $folderNginx/collectorServer.js
echo '    collectorServer: "[IPSTATION]"' >> $folderNginx/collectorServer.js
echo '}' >> $folderNginx/collectorServer.js

npm install pm2 -g

cd $folderNginx/ && pm2 start startcollector.js --name 'nginxCollector' || true
pm2 save || true
pm2 startup systemd || true

service nginx restart || service nginx start

exit 0