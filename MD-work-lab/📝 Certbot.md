https://certbot.eff.org/

### Docker

Let's encrypt SSL certificates using certbot in docker
https://gist.github.com/maxivak/4706c87698d14e9de0918b6ea2a41015
  
Directories on host machine:
* `/data/certbot/letsencrypt`
* `/data/certbot/www`

Nginx server in docker container
```
docker run -d --name nginx \
    ...
    -v /data/certbot/letsencrypt:/etc/letsencrypt
    -v /data/certbot/www:/var/www/certbot
    nginx
    
```

config file for your site 
```bash
server {
  listen 80;
  server_name mysite.com;

  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }

  location / {
      return 301 https://$host$request_uri;
  }
}


server {
  listen 443 ssl;
  server_name mysite.com;

  access_log /var/log/nginx/access.log combined_ssl;

  ssl_certificate /etc/letsencrypt/live/mysite.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/mysite.com/privkey.pem;

  #include /data/letsencrypt/options-ssl-nginx.conf;
  #ssl_dhparam /data/letsencrypt/ssl-dhparams.pem;

  location / {
      set $upstream "site_upstream";

      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header Host $http_host;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

      proxy_set_header X-Real-Port $server_port;
      proxy_set_header X-Real-Scheme $scheme;
      proxy_set_header X-NginX-Proxy true;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-Ssl on;

      expires off;

      proxy_pass http://$upstream;
  }
}

upstream site_upstream{
    server 51.1.0.20:80;
}

```


run certbot 
```bash
docker run --rm --name temp_certbot \
    -v /data/certbot/letsencrypt:/etc/letsencrypt \
    -v /data/certbot/www:/tmp/letsencrypt \
    -v /data/servers-data/certbot/log:/var/log \
    certbot/certbot:v1.8.0 \
    certonly --webroot --agree-tos --renew-by-default \
    --preferred-challenges http-01 --server https://acme-v02.api.letsencrypt.org/directory \
    --text --email mxdevit@gmail.com \
    -w /tmp/letsencrypt -d mysite.com

```

it will create new certificates in `/data/certbot/letsencrypt/live/mysite.com/`.


restart nginx 
```bash
docker restart nginx
```


# Script to manage SSL certificates

`/data/certbot/ssl_update.sh`

* generates a self-signed certificate if certificate doesn't exist
* renew certificates with Let's Encrypt if certificate expires or about to expire

see the script below.

inspired by  https://github.com/vdhpieter/docker-letsencrypt-webroot.

* update certificates

`ssl_mysite.sh`

```bash
#!/bin/bash

export CERT_DIR_PATH="/data/certbot/letsencrypt";
export WEBROOT_PATH="/data/certbot/www";
export LE_RENEW_HOOK="docker restart nginx"; # <--- change to your nginx server docker container name
export DOMAINS="mysite.com";
export EMAIL="myemail@gmail.com";
export EXP_LIMIT="30";
export CHECK_FREQ="30";
export CHICKENEGG="1";
export STAGING="0";

bash /data/certbot/ssl_update.sh
```

