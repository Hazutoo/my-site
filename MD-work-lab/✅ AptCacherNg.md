https://www.atlantic.net/vps-hosting/how-to-set-up-apt-caching-server-using-apt-cacher-ng-on-ubuntu-20-04/
https://help.ubuntu.com/community/Apt-Cacher%20NG

Local Apt Cacher jest to narzędzie służące do buforowania pakietów deb pobieranych przez menedżera pakietów Apt w systemach operacyjnych opartych na Debianie (np. Ubuntu).

**Apt Client** <- **Apt Cache** <- **Apt Mirror** 

W praktyce, kiedy masz wiele maszyn korzystających z tego samego repozytorium Apt, Local Apt Cacher pozwala na pobranie pakietów tylko raz, a następnie udostępnienie ich lokalnie dla wszystkich maszyn, które z niego korzystają. Dzięki temu przyspiesza to proces aktualizacji, ponieważ nie ma potrzeby pobierania tych samych pakietów przez każdą maszynę oddzielnie.

### Installation

```bash
sudo apt update
sudo apt install apt-cacher-ng

sudo systemctl start apt-cacher-ng
sudo systemctl enable apt-cacher-ng
```

Następnie konfigurujemy systemy klienckie tak, aby mogły korzystać z serwera Local Apt Cacher. Aby to zrobić tworzymy plik na każdej maszynie w podanej lokalizacji `/etc/apt/apt.conf.d/02proxy`

```
Acquire::http { Proxy "http://<adres_IP_LAC>:3142"; };
```

gdzie `<adres_IP_LAC>` to adres IP serwera Local Apt Cacher.

Zapisz plik i wykonaj polecenie "sudo apt-get update" na każdym kliencie, aby pobrać listy pakietów z serwera Local Apt Cacher.

Teraz systemy klienckie będą korzystały z serwera Local Apt Cacher jako pośrednika do pobierania pakietów deb, co przyspieszy proces aktualizacji i zaoszczędzi przepustowość internetową.

- [ ] Ansible, tworzy plik `/etc/apt/apt.conf.d/02proxy` i kopiuje na kazdą maszynę.

### Verify apt-cacher ng

```bash
tail -f /var/log/apt-cacher-ng/apt-cacher.log
```

also:

`http://your-server-ip:3142/acng-report.html`

![[Pasted image 20230417095736.png]]

### Config

You can use the /etc/hosts.allow and /etc/hosts.deny for controling access.

```
nano /etc/hosts.allow
apt-cacher-ng : 192.168.0.10 192.168.0.11

nano /etc/hosts.deny
apt-cacher-ng : 192.168.1.100
```