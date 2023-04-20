### Add sudo to system

```bash
su root
nano /etc/group 
	-> sudo:x:27:jdulewicz
apt install sudo
```

### No password prompt for sudo user

If you want sudo group members to execute commands without password, add the line:

```bash
sudo visudo
	add line -> %sudo ALL=(ALL) NOPASSWD: ALL
```

### Find where is package:

```bash
dpkg -S app_name
which app_name
whereis app_name
locate app_name
sudo find / -name "app_name"
```