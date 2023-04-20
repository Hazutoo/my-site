http://pi.hole:31415

https://github.com/pi-hole/docker-pi-hole

`docker-compose.yml`
```yaml
version: "3"

# More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
services:
  pihole:
    container_name: pihole
    image: pihole/pihole:latest
    # For DHCP it is recommended to remove these ports and instead add: network_mode: "host"
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "31415:80/tcp"
    environment:
      TZ: 'Europe/Warsaw'
      # WEBPASSWORD: 'set a secure password here or it will be random'
    # Volumes store your data between container upgrades
    volumes:
      - './etc-pihole:/etc/pihole'
      - './etc-dnsmasq.d:/etc/dnsmasq.d'
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    restart: unless-stopped
```

```bash
mkdir etc-pihole etc-dnsmasq.d
docker compose up -d
```

Edit on your local computer hosts file:

```
# Homelab
192.168.1.1    pi.hole
```

### Pihole hosts lists:

- https://firebog.net
- https://big.oisd.nl/
- https://raw.githubusercontent.com/hoshsadiq/adblock-nocoin-list/master/nocoin.txt
- https://majkiit.github.io/polish-ads-filter/?adblocker=Ph

### Sites to check:

- https://d3ward.github.io/toolz/adblock.html
