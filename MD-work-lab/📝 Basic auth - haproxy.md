# Dodawanie usera do haproxy basic auth:

```bash
mkpasswd -m sha-256 haslo
```

Powinno zwrócić:
`$5$6yUyT.cQy0ES7VPS$6Z/q6fINT6sQWjGGZ2oMymfFPCJdcxUP3RSpfzvcdv2`

_sudo vim /etc/haproxy/haproxy.cfg_

```bash
user s.obrzut password $5$hgVBDnplZS/uAUZY$nsyiD6NxmSiuoQHBFw1pgAMOGMk4oaEnSiQnSZ6O1gA
```

```bash
sudo systemctl reload-or-restart haproxy.service
```