# Instalacja prometheus, node exporter, grafana

https://ourcodeworld.com/articles/read/1686/how-to-install-prometheus-node-exporter-on-ubuntu-2004
https://medium.com/devops-dudes/prometheus-alerting-with-alertmanager-e1bbba8e6a8e
https://computingforgeeks.com/how-to-install-prometheus-on-rhel-8/

## Node exporter

```bash
wget https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
tar xvf node_exporter-1.5.0.linux-amd64.tar.gz
cd node_exporter-1.4.0.linux-amd64 
sudo cp node_exporter /usr/local/bin 
cd 
rm -rf node_exporter-1.5.0.linux-amd64  
sudo useradd --no-create-home --shell /bin/false node_exporter 
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter 
sudo nano /etc/systemd/system/node_exporter.service 
sudo systemctl daemon-reload 
sudo systemctl start node_exporter.service 
sudo systemctl enable node_exporter.service
```

```bash
[Unit]
Description=Node Exporter
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
```

## Prometheus

```bash
sudo groupadd --system prometheus
sudo useradd -s /sbin/nologin --system -g prometheus prometheus
sudo mkdir /var/lib/prometheus

for i in rules rules.d files_sd; do
 sudo mkdir -p /etc/prometheus/${i};
done

curl -s https://api.github.com/repos/prometheus/prometheus/releases/latest \
  | grep browser_download_url \
  | grep linux-amd64 \
  | cut -d '"' -f 4 \
  | wget -qi -

tar xvf prometheus-*.tar.gz
cd prometheus-*/
sudo cp prometheus promtool /usr/local/bin/

sudo cp -r prometheus.yml consoles/ console_libraries/ /etc/prometheus/ 

```

 _/etc/prometheus/prometheus.yml_
 
```yml
# Global config
global: 
  scrape_interval:     15s # Set the scrape interval to every 15 seconds. Default is every 1 minute.  
  evaluation_interval: 15s # Evaluate rules every 15 seconds. The default is every 1 minute.  
  scrape_timeout: 15s  # scrape_timeout is set to the global default (10s).

# A scrape configuration containing exactly one endpoint to scrape:# Here it's Prometheus itself.
scrape_configs:
  # The job name is added as a label `job=<job_name>` to any timeseries scraped from this config.
  - job_name: 'prometheus'

    # metrics_path defaults to '/metrics'
    # scheme defaults to 'http'.

    static_configs:
    - targets: ['localhost:9090']
```

_/etc/systemd/system/prometheus.service_:

```bash
[Unit]
Description=Prometheus
Documentation=https://prometheus.io/docs/introduction/overview/
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.console.templates=/etc/prometheus/consoles \
  --web.console.libraries=/etc/prometheus/console_libraries \
  --web.listen-address=0.0.0.0:9090 \
  --web.external-url=

SyslogIdentifier=prometheus
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo chown -R prometheus:prometheus /etc/prometheus
sudo chmod -R 775 /etc/prometheus/
sudo chown -R prometheus:prometheus /var/lib/prometheus/

sudo systemctl daemon-reload
sudo systemctl start prometheus

sudo systemctl enable prometheus
```

```bash
sudo firewall-cmd --add-port=9090/tcp --permanent
sudo firewall-cmd --reload
```

## Grafana

_/etc/yum.repos.d/grafana.repo_:

```
[grafana]  
name=grafana  
baseurl=https://packages.grafana.com/oss/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.cr
```

```bash
sudo dnf update
sudo dnf install grafana -y
sudo systemctl start grafana-server 
sudo systemctl enable --now grafana-server
```

### Jeśli chcemmy wystawić na innym porcie musimy wydetyować plik poniżej i zrestartować usługę

```bash
sudo nano /usr/share/grafana/conf/defaults.ini` `bash sudo systemctl restart grafana-server
```

### Otwarcie portu na firewall dla grafana

```bash
sudo firewall-cmd --add-port=3000/tcp --permanent
sudo firewall-cmd --reload
```

### Dostep web dla grafany

```http
http://localhost:3000 credentials: admin : admin
```

## Dashboard

Należy dodać źródło danych jako prometheus:

![[Pasted image 20230404100536.png]]

Następnie zaimportować dasboard:

[https://grafana.com/grafana/dashboards/1860-node-exporter-full/](https://grafana.com/grafana/dashboards/1860-node-exporter-full/ "https://grafana.com/grafana/dashboards/1860-node-exporter-full/")

![[Pasted image 20230404100110.png]]
