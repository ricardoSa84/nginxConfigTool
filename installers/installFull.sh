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


print_status() {
	if [ -f /etc/redhat-release ]; then
	  local outp=$(echo "$1") # | sed -r 's/\\n/\\n## /mg')
	  echo
	  echo -e "## ${outp}"
	  echo
	fi

	if [ -f /etc/lsb-release ]; then	  
		echo
		echo "## $1"
		echo
	fi
}

if test -t 1; then # if terminal
    ncolors=$(which tput > /dev/null && tput colors) # supports color
    if test -n "$ncolors" && test $ncolors -ge 8; then
    	termcols=$(tput cols)
    	bold="$(tput bold)"
    	underline="$(tput smul)"
    	standout="$(tput smso)"
    	normal="$(tput sgr0)"
    	black="$(tput setaf 0)"
    	red="$(tput setaf 1)"
    	green="$(tput setaf 2)"
    	yellow="$(tput setaf 3)"
    	blue="$(tput setaf 4)"
    	magenta="$(tput setaf 5)"
    	cyan="$(tput setaf 6)"
    	white="$(tput setaf 7)"
    fi
fi

print_bold() {
	title="$1"
	text="$2"

	echo
	echo "${red}================================================================================${normal}"
	echo
	echo  "    	${bold}${yellow}${title}${normal}"
	echo
	echo  "  ${text}"
	echo
	echo "${red}================================================================================${normal}"
}
print_bold \
"                            NGINX Config Tool                           " "\
${bold} Install NGINX Config Tool ${normal}"

if [ $(id -u) -ne 0 ] ; then
	print_bold \
	"                            NGINX Config Tool                           " "\
	${bold}${red}   Please run as root ${normal}"
	exit 1 ;
fi
cd
folderNginx=$(pwd)/nginxConfigTool
SELINUX=disabled

# If system redhat
if [ -f /etc/redhat-release ]; then

	distro=$(sed -n 's/^distroverpkg=//p' /etc/yum.conf)
	releasever=$(rpm -q --qf "%{version}" -f /etc/$distro)
	basearch=$(rpm -q --qf "%{arch}" -f /etc/$distro)

	print_status "Add source list ngnix."
	exec_cmd "echo '[nginx]' > /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'name=nginx repo' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'baseurl=http://nginx.org/packages/centos/$releasever/$basearch/' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'gpgcheck=0' >> /etc/yum.repos.d/nginx.repo"
	exec_cmd "echo 'enabled=1' >> /etc/yum.repos.d/nginx.repo"

	print_status "Add source list mongodb."
	exec_cmd "echo '[mongodb-org-3.2]' > /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'name=MongoDB Repository' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.2/x86_64/' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgcheck=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'enabled=1' >> /etc/yum.repos.d/mongodb-org.repo"
	exec_cmd "echo 'gpgkey=https://www.mongodb.org/static/pgp/server-3.2.asc' >> /etc/yum.repos.d/mongodb-org.repo"

	exec_cmd "sudo yum repolist"

	print_status "Install nodejs version 8."
	exec_cmd "curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -"
	exec_cmd "sudo yum install -y nodejs"

	print_status "Install ngnix."
	exec_cmd "sudo yum install -y nginx"
	exec_cmd "sudo chkconfig nginx on"

	print_status "Install git."
	exec_cmd "sudo yum install -y git"

	print_status "Install database MongoDB."
	exec_cmd "sudo yum install -y  mongodb-org"
	exec_cmd "sudo systemctl start mongod || sudo systemctl reload mongod"

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

	print_status "Add source list ngnix."
  	exec_cmd "wget https://nginx.org/keys/nginx_signing.key -O - | sudo apt-key add - "
  	exec_cmd "echo 'deb http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' > /etc/apt/sources.list.d/nginx.list"
  	exec_cmd "echo 'deb-src http://nginx.org/packages/ubuntu/ ${DISTRO} nginx' >> /etc/apt/sources.list.d/nginx.list"

  	print_status "Add source list mingodb."
  	exec_cmd "sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927"
  	exec_cmd "echo 'deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse' | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list"

  	print_status "Install nodejs version 8."
  	exec_cmd "curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -"
  	exec_cmd "sudo apt-get install -y nodejs"


  	print_status "Install ngnix."
  	exec_cmd "sudo apt-get install -y nginx"
  	exec_cmd "sudo update-rc.d nginx defaults"

  	print_status "Install git."
  	exec_cmd "sudo apt-get install -y git"

  	print_status "Install database MongoDB."
  	exec_cmd "sudo apt-get install -y mongodb mongodb-server"

fi

if [ ! -d /root/.ssh ]; then
  exec_cmd "sudo mkdir .ssh"
fi

cd /root && cd .ssh && [ -f ./id_rsa ] && echo "Rsa Key Found" || (echo "Rsa Key Not found, Create RSA Key" && ssh-keygen -t rsa -N "" -f id_rsa)

cd
exec_cmd 'rm -rf ${folderNginx}'
print_status "Clone git repository NGINX Config Tool"
exec_cmd 'git clone https://github.com/ricardoSa84/nginxConfigTool'

print_status "Install node models"
exec_cmd "cd ${folderNginx}/ && sudo npm install"
exec_cmd "cd ${folderNginx}/ && sudo npm install opennebula"

cd
print_status "Copy necessary files to works this program."
exec_cmd "sudo mv -f ${folderNginx}/FilesMove/dashboard /etc/nginx/ || sudo cp -f ${folderNginx}/FilesMove/dashboard/* /etc/nginx/dashboard/ || true"
exec_cmd "sudo cp ${folderNginx}/FilesMove/conf.d/* /etc/nginx/conf.d/ || true"

print_status "Backup nginx.conf to nginx.conf.back."
exec_cmd "sudo mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.back"

print_status "Add new file nginx.conf."
# If system redhat
if [ -f /etc/redhat-release ]; then
	exec_cmd "sudo cp ${folderNginx}/FilesMove/nginx/redhat/nginx.conf /etc/nginx/ || true"
# if system debian
elif [ -f /etc/lsb-release ]; then
	exec_cmd "sudo cp ${folderNginx}/FilesMove/nginx/debian/nginx.conf /etc/nginx/ || true"
fi

print_status "Remove Old Files."
exec_cmd "sudo rm -rf ${folderNginx}/FilesMove || true"

print_status "Populate MongoDB."
exec_cmd "cd ${folderNginx}/ && node startPopulateDB.js || true"

print_status "Install module to run nginxConfigTool."
exec_cmd "sudo npm install pm2 -g"
cd
exec_cmd "cd ${folderNginx}/ && sudo pm2 start main.js --name 'nginxConfigTool' || true"
exec_cmd "sudo pm2 save || true"
exec_cmd "sudo pm2 startup systemd || true"

print_status "Restart system services."
exec_cmd "sudo service nginx restart || sudo service nginx start"

print_bold \
"                            NGINX Config Tool                           " "\
	${bold} This install complete.
	${yellow} Restart your system ${normal}
	${bold} Access your favorite browser and access to this server at
	${blue} http://$(hostname -I) ${normal}
	 Use
		---------------------------
		| user : \"admin@admin.pt\" |
		| pass : \"admin\"          |
		---------------------------

Autores: Nelson Gomes & Ricardo Anacleto	  		"

exit 0