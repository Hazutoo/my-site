##### Server Cache vs. Browser Cache vs. Site Cache: What’s the Difference?
https://wp-rocket.me/wordpress-cache/different-types-of-caching/

https://www.varnish-software.com/developers/tutorials/installing-varnish-ubuntu/

app1 app2 / if1 if2

### Installation:

```bash
sudo apt-get update
sudo apt-get install debian-archive-keyring curl gnupg apt-transport-https
curl -s -L https://packagecloud.io/varnishcache/varnish60lts/gpgkey | sudo apt-key add -
. /etc/os-release
sudo tee /etc/apt/sources.list.d/varnishcache_varnish60lts.list > /dev/null <<-EOF
deb https://packagecloud.io/varnishcache/varnish60lts/$ID/ $VERSION_CODENAME main
EOF
sudo tee /etc/apt/preferences.d/varnishcache > /dev/null <<-EOF
Package: varnish varnish-*
Pin: release o=packagecloud.io/varnishcache/*
Pin-Priority: 1000
EOF
sudo apt-get update
sudo apt-get install varnish
```

### Configuration:

`/lib/systemd/system/varnish.service`
```bash
[Unit]
Description=Varnish Cache, a high-performance HTTP accelerator
After=network-online.target nss-lookup.target

[Service]
Type=forking
KillMode=process

# Maximum number of open files (for ulimit -n)
LimitNOFILE=131072

# Locked shared memory - should suffice to lock the shared memory log
# (varnishd -l argument)
# Default log size is 80MB vsl + 1M vsm + header -> 82MB
# unit is bytes
LimitMEMLOCK=85983232

# Enable this to avoid "fork failed" on reload.
TasksMax=infinity

# Maximum size of the corefile.
LimitCORE=infinity

ExecStart=/usr/sbin/varnishd \
	  -a :6081 \
	  -a localhost:8443,PROXY \
	  -p feature=+http2 \
	  -f /etc/varnish/default.vcl \
	  -s malloc,256m
ExecReload=/usr/sbin/varnishreload

[Install]
WantedBy=multi-user.target
```

If you want to override some of the runtime parameters in the `varnish.service` file, you can run the following command:

```bash
sudo systemctl edit --full varnish
```

It is also possible to directly write the changes to `/etc/systemd/system/varnish.service`.

First you need to copy the original `varnish.service` file to the `/etc/systemd/system/` folder:

```bash
sudo cp /lib/systemd/system/varnish.service /etc/systemd/system/
```

After modifying `/etc/systemd/system/varnish.service`, you have ro reload the Systemd daemon by running the following command:

```bash
sudo systemctl daemon-reload
```

### Changing parameters

We’ll change this to port `80`. We’ll also increase the size of the cache to two gigabytes.

After having applied the configuration changes, the `ExecStart` statement now looks like this:

```bash
ExecStart=/usr/sbin/varnishd \
	  -a :80 \
	  -a localhost:8443,PROXY \
	  -p feature=+http2 \
	  -f /etc/varnish/default.vcl \
	  -s malloc,2g
```

Don’t forget to run `sudo systemctl daemon-reload` when manually changing the unit file.

### Apache

If you’re using Apache, you have replace the listen port value in `/etc/apache2/ports.conf` from `Listen 80` to `Listen 8080`. You also need to replace `<VirtualHost *:80>` with `<VirtualHost *:8080>` in all virtual host files.

The following command will take care of that for all `.conf` files in the `/etc/httpd` folder, including its subfolders:

```bash
sudo find /etc/apache2 -name '*.conf' -exec sed -r -i 's/\bListen 80\b/Listen 8080/g; s/<VirtualHost ([^:]+):80>/<VirtualHost \1:8080>/g' {} ';'
```

### Nginx

If you’re using Nginx, it’s simply a matter of modifying the listening port in the various virtual host configurations.

The following command will replace `listen 80;` with `listen 8080;` in all virtual host files:

```bash
sudo find /etc/nginx -name '*.conf' -exec sed -r -i 's/\blisten ([^:]+:)?80\b([^;]*);/listen \18080\2;/g' {} ';'
```

This command will replace `listen 80;` with `listen 8080;` in all `.conf` files in the `/etc/nginx/` folder and all of its subfolders.

### VCL backend configuration

https://varnish-cache.org/docs/6.0/users-guide/vcl-backends.html
Work in progress.  🏗️🧰

### Restart the services

We have made some changes to various configuration files. For these changes to take effect, we need to restart Varnish and your web server.

#### Apache
Run the following command if your web server is running Apache:

```bash
sudo systemctl restart apache2 varnish
```

#### Nginx
Run the following command if you’re using Nginx instead of Apache:

```bash
sudo systemctl restart nginx varnish
```
