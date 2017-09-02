yum update -y
yum install nano net-tools epel-release -y

nano /etc/sysconfig/selinux
	- SELINUX=disabled

cat << EOT > /etc/yum.repos.d/opennebula.repo
[opennebula]
name=opennebula
baseurl=https://downloads.opennebula.org/repo/5.4/CentOS/7/x86_64
enabled=1
gpgkey=https://downloads.opennebula.org/repo/repo.key
gpgcheck=1
#repo_gpgcheck=1
EOT

yum install opennebula-server opennebula-sunstone opennebula-ruby opennebula-gate opennebula-flow -y

/usr/share/one/install_gems

systemctl disable firewalld && systemctl stop firewalld
systemctl enable opennebula && systemctl start opennebula
systemctl enable opennebula-sunstone && systemctl start opennebula-sunstone

su - oneadmin
cat << EOT > ~/.ssh/config
Host *
    StrictHostKeyChecking no
    UserKnownHostsFile /dev/null
EOT

chmod 600 ~/.ssh/config

cat ~/.one/one_auth <- Para saber a pass de acesso no browser

--------------------------- Install Nodes -----------------------
yum install opennebula-node-kvm -y

systemctl enable libvirtd.service && systemctl start libvirtd.service
systemctl enable nfs-client.target && systemctl start nfs-client.target

nano /etc/sysconfig/network-scripts/ifcfg-enp2s0 ->nome da interface ethernet
DEVICE=enp2s0 -> alterar o nome para o que pertence a interface
BOOTPROTO=none
NM_CONTROLLED=no
ONBOOT=yes
TYPE=Ethernet
BRIDGE=br0

nano /etc/sysconfig/network-scripts/ifcfg-br0
DEVICE=br0
TYPE=Bridge
ONBOOT=yes
BOOTPROTO=dhcp
NM_CONTROLLED=no

ou 

DEVICE=br0
TYPE=Bridge
IPADDR=192.168.1.100
NETMASK=255.255.255.0
ONBOOT=yes
BOOTPROTO=static
NM_CONTROLLED=no

systemctl restart network.service

Executar como oneadmin
ssh-keyscan localhost >> /var/lib/one/.ssh/known_hosts
