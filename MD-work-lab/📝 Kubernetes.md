# K8s

*Naukę zacząłem łącząc się zdalnie do serwera ubuntu poprzez vsc.*

Aby zacząć podstawowo przygodę z k8s należy kolejno:

1. Zainstralować dockera (ponieważ będę używał go jako driver do kubernetesa):

``` bash
curl -fsSL https://get.docker.com -o get-docker.sh
chmod +x get-docker.sh
./get-docker.s
sudo usermod -aG docker $USER
```

2. Zainstalować minikube:

``` bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

3. Ustawić driver (w moim przypadku jest to docker):

``` bash
minikube config set driver docker
```

4. Uruchomić klaster:

``` bash
minikube start
```

W tym momencie możemy uruchomić dashboard w celu sprawdzenia czy wszystko zostało poprawnie wykonane.

``` bash
minikube dashboard
```

![[Pasted image 20230122150501.png]]

Na naszym lokalnym komputerze powinniśmy mieć możliwość wyświetlenia strony w przeglądarce (jest to możliwe dzięki proxy, które uruchomił vsc)

![[Pasted image 20230122150420.png]]

5. Intalacja #kubectl:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo curl -fsSLo /etc/apt/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubectl
```

---

Note: In releases older than Debian 12 and Ubuntu 22.04, /etc/apt/keyrings does not exist by default. You can create this directory if you need to, making it world-readable but writeable only by admins.

---

# Rozpoczynamy pracę

Sprawdzenie informacji o wszystkich węzłach (node), które uczestniczą w danym klastrze:

```bash
kubectl get nodes
```

Output:

```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   31m   v1.25.3
```

Jak to działa? Wysyłane jest odpowiednie zapytanie do api serwera. Wraz z instalacją minikube instaluje się serwer api. Samo kubectl jest aplikacją w formie klienta, która komunikuje się po https. 

Gdy kończymy pracę (wyłączamy komputer) należy zatrzymać klaster poleceniem:

```bash
minikube stop
```

Uruchamiamy go ponownie poprzez:

```bash
minikube start
```

Jeśli użyto drivera dockera możemy na naszym hoście zobaczyć kontener minikube:

``` bash
docker ps
```

![[Pasted image 20230122171132.png]]

Możemy dostać się naszego klastra poprzez polecenie :

```bash
minikube ssh
```

Wewnątrz konsoli możemy zobaczyć uruchomione kontenery dockera:

```bash
docker ps
```

![[Pasted image 20230122171651.png]]

Znajdźmy teraz dla przykładu nasz kontener z API:

```bash
docker ps | grep "api"
```

![[Pasted image 20230122171912.png]]

Narzędzie kubectl czerpie informacje dotyczące połączenia z klastrem Kubernetes z pliku konfiguracyjnego. Ten plik znajduje się w katalogu .kube znajdującym się w katalogu domowym użytkownika. W tym katalogu można znaleźć również katalog cache oraz plik config, które również mogą zawierać informacje dotyczące połączenia. Informacje te obejmują między innymi adres IP oraz port, z jakiego należy się łączyć, a także dane uwierzytelniania, takie jak nazwa użytkownika, którego należy użyć do połączenia.

![[Pasted image 20230122172335.png]]

Zawartość pliku `config`:

```yaml
apiVersion: v1
clusters:
- cluster:
    certificate-authority: /home/jarek/.minikube/ca.crt # gdzie znajdują się certyfikaty (jest on generowany automatycznie)
    extensions:
    - extension:
        last-update: Sun, 22 Jan 2023 13:19:22 UTC
        provider: minikube.sigs.k8s.io
        version: v1.28.0
      name: cluster_info
    server: https://192.168.49.2:8443 # aders ip naszego klastra oraz po jakim porcie się łączymy
  name: minikube # na jakiego użytkownika się logujemy
contexts:
- context:
    cluster: minikube
    extensions:
    - extension:
        last-update: Sun, 22 Jan 2023 13:19:22 UTC
        provider: minikube.sigs.k8s.io
        version: v1.28.0
      name: context_info
    namespace: default
    user: minikube
  name: minikube
current-context: minikube
kind: Config
preferences: {}
users:
- name: minikube
  user:
    client-certificate: /home/jarek/.minikube/profiles/minikube/client.crt
    client-key: /home/jarek/.minikube/profiles/minikube/client.key
```

Aby skutecznie zarządzać środowiskiem Kubernetes, należy skorzystać z narzędzia kubectl. To wygodne rozwiązanie pozwala na zarządzanie klastrem z poziomu lokalnego komputera, bez konieczności połączenia się przez SSH z zdalnym serwerem. W przypadku potrzeby zarządzania klastrem z innej lokalizacji, wystarczy odpowiednio zmodyfikować plik konfiguracyjny. Narzędzie kubectl jest dostępne dla systemów operacyjnych Windows, macOS oraz Linux i nie wymaga zainstalowania dodatkowego oprogramowania.

# Nasz pierwszy pod

Czym jest ? To najmniejsza jednostka zarządzania w Kubernetes, która reprezentuje jeden lub więcej kontenerów działających razem na jednym hoście. 

Uruchomimy teraz pierwszy pod zawierający kontener z obrazem nginx:

```bash
kubectl run nginx --image=nginx --restart=Never
```

Jeśli nie dodamy flagi `--restart=never` zostanie uruchomiony jedynie deployment. Na ten moment nie wiemy czym dokładnie jest, dowiemy się tego później. Musimy to zrobić aby uniknąć pewnych komplikacji przy uruchamianiu pierwszego kontenera / poda. Dzięki temu, że używamy minikube, mamy pewność, że nginx został uruchomiony tylko na naszym jednym hoście.

Wyświetlenie informacji o naszych podach:

```bahs
kubectl get pods
```

Output:

```
NAME    READY   STATUS    RESTARTS   AGE
nginx   1/1     Running   0          119s
```

Wyświetlenie dodatkowych informacji o naszym podzie:

```bash
kubectl describe pod nginx
```

![[Pasted image 20230122180904.png]]

Widzimy tu jakie akcje zostały wykonane w naszym kontenerze w ostatniej sekcji events. 

```
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  15m   default-scheduler  Successfully assigned default/nginx to minikube
  Normal  Pulling    15m   kubelet            Pulling image "nginx"
  Normal  Pulled     15m   kubelet            Successfully pulled image "nginx" in 1.367036434s
  Normal  Created    15m   kubelet            Created container nginx
  Normal  Started    15m   kubelet            Started container nginx
```

Możemy sprawdzić wewnątrz klastra jaki obraz został użyty do uruchomienia kontenera:

```bash
docker@minikube:~$ docker image ls | grep "nginx"
nginx                                     latest    a99a39d070bf   11 days ago     142MB
```

Poda usuwamy poprzez polecenie (w tym przypadku nazwa poda to `nginx`):

```bash
kubectl delete pod nginx
```

# Pliki YAML

Składnia podstawowego pliku yaml do uruchomienia poda z obrazem nginx:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx #nazwa poda
spec:
  containers:
  - name: strefa-nginx-container #nazwa kontenera
    image: nginx:latest
```

Po stworzeniu możemy uruchomić poda z pliku yaml:

```bash
kubectl apply -f pod_strefa_nginx.yaml
```

Jeśli zmienimy coś w naszym yamlu, możemy po prostu wykonać wyżej podane polecenie, a pod zostanie zaktualizowany. Podczas aktualizacji Kubernetes tworzy nowy pod z nowymi ustawieniami, a następnie przekierowuje ruch na nowy pod i usuwa stary pod. Dzięki temu proces aktualizacji jest niezauważalny dla użytkownika końcowego i nie powoduje przerw w działaniu aplikacji.

Spróbujmy uruchomić ubuntu poprzez yaml:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: strefa-ubuntu
spec:
  containers:
  - name: ubuntu-container
    image: ubuntu:22.04
```

Po sprawdzeniu stanu poda dowiemy się, że status to na zmianę:

- ContainerCreating
- CrashLoopBackOff
- Completed

oraz ilość restartów zwiększa się iteracyjnie. Dlaczego tak się dzieje? 

Zanim poznamy odpowiedź sprawdźmy jeszcze plik konfiguracyjny poda poprzez polecenie, wskazując na jego nazwę:

```bash
kubectl edit pod strefa-ubuntu
```

Widzimy, że danych jest o wiele więcej niż podaliśmy wstępnie.

![[Pasted image 20230122215545.png]]
![[Pasted image 20230122215601.png]]

Widzimy tam informację `restartPolicy: Always` . Oznacza to, że Kubernetes będzie ciągle próbował uruchomić kontener na podstawie zdefiniowanego obrazu, nawet jeśli kontener zakończy działanie lub zostanie usunięty. W tym przypadku, ponieważ nie ma informacji o procesie, który ma być uruchomiony w kontenerze Ubuntu, kontener kończy działanie i uruchamia się na nowo w pętli.

Zmodyfikujmy więc nasz plik yaml dodając informację o procesie, który ma zostać uruchomiony.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: strefa-ubuntu
spec:
  containers:
  - name: ubuntu-container
    image: ubuntu:22.04
    command: [ "sleep", "inf" ]
```

Gdy spróbujemy wgrać zmodyfikowany yaml o trzymamy komunikat o błędzie informujący, że nie możemy zmienić podanej wartości. Możemy w tym przypadku uruchomić nowy pod usuwając poprzedni.

Ponieważ w kubernetes działają kontenery możemy wykonywać polecenia odpowiadające dla dockera:

```
kubectl exec strefa-ubuntu -- ps aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0   2788  1004 ?        Ss   21:11   0:00 sleep inf
root          13  0.0  0.0   7060  1572 ?        Rs   21:17   0:00 ps aux
```

 W przedstawionym przykładzie `strefa-ubuntu` jest nazwą POD-u, a `ps aux` jest poleceniem, które jest wykonywane na tym POD-ie. W wyniku tego polecenia otrzymujemy listę procesów działających w kontenerze strefa-ubuntu.

Możemy uruchomić powłokę w sposób analogiczny dla dockera:

```bash
kubectl exec strefa-ubuntu -it -- bash
root@strefa-ubuntu:/# 
```

# Dwa kontenery w jednym podzie

Napiszmy teraz yaml'a uruchamiającego dwa kontenery w podzie:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: ubuntu
    image: ubuntu:22.04
    command: [ "sleep", "inf" ]
  - name: nginx
    image: nginx
    ports:
      - containerPort: 80
```

Po uruchomieniu możemy sprawdzić czy pod z kontenerami uruchomił się:

```bash
NAME   READY   STATUS    RESTARTS   AGE
app    2/2     Running   0          16s
```

Jak widać w kolumnie `READY` widzimy iż w podzie znajdują się dwa uruchomione kontenery.

Aby wyświetlić logi kontenera należy wykonać polecenie (`-c nazwa kontenera` jest wymagane w przypadku, gdy w podzie znajduje się więcej niż jeden kontener) :

```
kubectl logs app -c nginx
```

Dodając flagę `-f` możemy na bieżąco śledzić pojawiające się logi.

W naszym przypadku przy poleceniu exec również musimy wskazać kontener poprzez:

```bash
kubectl exec -c nginx -it app bash
```

Gdy tego nie zrobimy zostanie wybrany pierwszy kontener, który został wpisany w pliku yaml.

Jeśli na przykład wewnątrz kontenera wykonamy polecenie curl, będziemy mogli to zobaczyć w logach.

```
127.0.0.1 - - [22/Jan/2023:22:20:13 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/7.74.0" "-"
```

Pamiętajmy, że kontenery są tak skonstruowane aby uruchamiać jedną aplikację powiązaną z tym pidem, który jest uruchomiony. Są przeznaczone do uruchamiania pojedynczej aplikacji związanej z procesem, który jest uruchomiony wewnątrz kontenera. Konteneryizacja pozwala na izolowanie aplikacji od innych procesów działających na tym samym hoście, co pozwala na lepsze zarządzanie i wykorzystanie zasobów.

Kontenery w danym podzie dzielą przestrzeń w postaci pamięci, portów oraz sieci. Dlatego z poziomu kontenera ubuntu wykonując `curl localhost` otrzymamy wynik identyczny jak na nginx. Każdy pod ma adres IP. Jest to wspólna wartość rozróżniająca pody. 

![[Pasted image 20230122235457.png]]

# Wspólne porty w podzie

W przypadku pliku yaml, gdzie przypiszemy te same porty do różnych kontenerów uzyskamy błąd. W logach zobaczymy ponowne próby uruchomienia kontenera. Na jednym adresie IP na danym porcie może działać tylko jedna aplikacja.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: ubuntu
    image: ubuntu:22.04
    command: [ "sleep", "inf" ]
  - name: nginx
    image: nginx
    ports:
      - containerPort: 80
  - name: httpd
    image: httpd
    ports:
      - containerPort: 80
```

Jednak gdy zmienimy wartość dla portu w kontenerze https na 8080 problem nie ustąpi.

```
kubectl logs app -c httpd
AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 172.17.0.5. Set the 'ServerName' directive globally to suppress this message
(98)Address already in use: AH00072: make_sock: could not bind to address 0.0.0.0:80
no listening sockets available, shutting down
AH00015: Unable to open logs
```

Domyślna konfiguracja kontenera to dalej wartość 80. Aby rozwiązać ten problem, należy skorzystać z innej konfiguracji, przebudować obraz lub użyć volumenu, który odpowiednio nadpisuje konfigurację odpowiedniego kontenera.

# Pod lifecycle

Wróćmy pamięcią do problemu dotyczącego `CrashLoopBackOff` oraz polityki restartu w podzie.
Wartość polityki dodajemy w pliku yaml poda.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app
spec:
  containers:
  - name: ubuntu
    image: ubuntu:22.04
    command: [ "sleep", "inf" ]
  restartPolicy: OnFailure
```

W Kubernetes istnieją trzy główne wartości dla polityki restartu:

-   `Always` - oznacza, że kontener zawsze będzie restartowany, nawet jeśli zakończy działanie z błędem. Jest to domyślna wartość, jeśli nie określono innej polityki restartu. Może to prowadzić do sytuacji, w której kontener jest ciągle restartowany i nie jest w stanie poprawnie uruchomić się lub zakończyć działanie.
-   `OnFailure` - oznacza, że kontener będzie restartowany tylko wtedy, gdy zakończy działanie z błędem. Jeśli kontener zakończy działanie z powodu wywołania polecenia zakończenia działania, nie zostanie on ponownie uruchomiony.
-   `Never` - oznacza, że kontener nigdy nie zostanie automatycznie ponownie uruchomiony, nawet jeśli zakończy działanie z błędem. W takim przypadku, jeśli kontener zakończy działanie z błędem, będzie trzeba ręcznie go ponownie uruchomić.

Wartości te pozwalają na dostosowanie strategii restartu do potrzeb konkretnego przypadku użycia, np. jeśli kontener jest krytyczny dla działania całego systemu możemy ustawić restartPolicy na Always, natomiast jeśli jest to kontener odpowiedzialny za logowanie wartość OnFailure będzie odpowiednią.

# Replikacja - niezawodnośc, równomierne obciązenie, skalowalność

Kubernetes umożliwia replikację podów, co pozwala na zwiększenie niezawodności aplikacji. Replikacja polega na utrzymywaniu kilku egzemplarzy podu z kontenerem działającym w różnych węzłach w klastrze. W przypadku awarii jednego z podów, inne zapewnią ciągłość działania aplikacji.

Równomierne obciążenie jest również ważnym aspektem replikacji, ponieważ pozwala na równomierne rozłożenie ruchu między replikami podów, co zwiększa wydajność i zmniejsza ryzyko przeciążenia pojedynczego podu.

Replikacja również umożliwia skalowanie aplikacji, poprzez dodawanie lub usuwanie podów w zależności od potrzeb. Dzięki temu możliwe jest dostosowanie liczby replik do obecnego obciążenia aplikacji, co zwiększa efektywność i pozwala na lepsze wykorzystanie zasobów.

# Replication controller

Pełni podobną rolę do tworzenia podów za pomocą pliku YAML z "kind: Pod". RC jest jednak narzędziem do zarządzania skalowaniem i odtwarzaniem podów, podczas gdy Pod jest jedynie pojedynczym obiektem kontenera. ReplicationController pozwala na utrzymanie określonej liczby kopii podów, automatycznie tworząc je i usuwając, aby zachować tę liczbę, podczas gdy Pod jest jedynie pojedynczą instancją kontenera. Nie musisz mieć oddzielnego pliku YAML dla podów, które mają być replikowane, ponieważ ReplicationController automatycznie tworzy i zarządza podami.

Stwórzymy yaml'a replication controllera dla poda o określonej konfiguracji:

Yaml dla poda (nie będziemy go uruchamiać, wzorujemy się na nim):

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod # nazwa poda
  labels:
    app: nginx-app
spec:
  containers:
  - name: nginx # nazwa kontenera
    image: nginx
    ports:
      - containerPort: 80
```

Yaml dla replication controllera:

```yaml
apiVersion: v1
kind: ReplicationController
metadata:
  name: nginx-rc # nazwa naszego replication controllera
spec:
  replicas: 4 # dowolna wartość, w zależności od potrzeb
  selector:
    app: nginx-app # odnosimy się do informacji o podach, które mają zostać replikowane - utrzymywane w podanej ilości
  template: # tutaj opisujemy dokładnie co było wykorzystywane przy tworzeniu naszego poda
    metadata:
      name: nginx-pod # Czy to jest opcjonalne? 
      labels:
        app: nginx-app
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Nazwa podów jest generowana automatycznie przez Kubernetes zgodnie z następującym formatem: `<nazwa RC>-<identyfikator unikalny>`. 

![[Pasted image 20230123011526.png]]

Jeśli istnieją już uruchomione pody odpowiadające konfiguracji ReplicationController, te pody nie zostaną usunięte, a RC utworzy ich tylko tyle, ile jest określone w pliku YAML. Jednak, jeśli ręcznie utworzysz nadmiarowy pod, ReplicationController usunie go, aby utrzymać określoną liczbę replik podów.

Usunięcie RC spowoduje jednocześnie odpowiadających im podów. Używamy w tym przypadku polecenia:

```bash
kubectl delete rc nginx-rc
```

# ReplicaSet

Jest nowszym mechanizmem Kubernetesa, który umożliwia utrzymanie określonej liczby replik podów.

Yaml dla ReplicaSet:

```yaml
apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: nginx-rs
spec:
  replicas: 4
  selector:
    matchLabels:
      app: nginx-app
  template:
    metadata:
      name: nginx-pod # Czy to jest opcjonalne? 
      labels:
        app: nginx-app
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Możemy na bieżąco edytować ilość replik dla RS:

```bash
kubectl scale rs --replicas=2 nginx-rs
```

Nie ma możliwości wpłynięcia na to, które pody zostaną usunięte. 
Jeśli chcemy wyłączyć naszą aplikację, zachowując ją możemy ustawić wartość `--replicas=0` .

# Deployment

Plik yaml dla deployment'u:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 4
  selector:
    matchLabels:
      app: nginx-app
  template:
    metadata:
      labels:
        app: nginx-app
    spec:
      containers:
        - name: nginx
          image: nginx
          ports:
            - containerPort: 80
```

Jak widać deployment uruchamia replicaset:

```
NAME                                     READY   STATUS    RESTARTS   AGE
pod/nginx-deployment-7f79864cdd-45g4q   1/1     Running   0          75s
pod/nginx-deployment-7f79864cdd-dmd4v   1/1     Running   0          75s
pod/nginx-deployment-7f79864cdd-hqqk6   1/1     Running   0          75s
pod/nginx-deployment-7f79864cdd-zzg6b   1/1     Running   0          75s

NAME                 TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)   AGE
service/kubernetes   ClusterIP   10.96.0.1    <none>        443/TCP   12h

NAME                                READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/nginx-deployment   4/4     4            4           76s

NAME                                           DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-7f79864cdd   4         4         4       76s
```

Aby zaktualizować deployment należy zedytować plik yaml i wgrać go poleceniem:

```bash
kubectl apply -f deployment.yaml
```

Możemy również np. podmienić obraz dla kontenerów poprzez:

```bash
kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1
```

Podmienia on kontenery w sposób nieprzerywający działania aplikacji. Użytkownik końcowy nie odczuje zmiany. Tworzy on dodatkowe pody z inną wersją i usuwa stare utrzymując wskazaną wartośc replik. Uzyskane jest to dzieki automatycznemu utworzeniu RS dla nowej wersji obrazu kontenera.

```
NAME                                          DESIRED   CURRENT   READY   AGE
replicaset.apps/nginx-deployment-6ddf4f4f4b   4         4         4       20s
replicaset.apps/nginx-deployment-79f8dcdb98   0         0         0       31s
```

Wyświetlmy informacje dotyczące naszego deploymentu poprzez polecenie:

```bash
kubectl describe deployment nginx-deployment
```

output:

```
Name:                   nginx-deployment
Namespace:              default
CreationTimestamp:      Mon, 23 Jan 2023 01:48:23 +0000
Labels:                 <none>
Annotations:            deployment.kubernetes.io/revision: 2
Selector:               app=nginx-app
Replicas:               4 desired | 4 updated | 4 total | 4 available | 0 unavailable
StrategyType:           RollingUpdate
MinReadySeconds:        0
RollingUpdateStrategy:  25% max unavailable, 25% max surge
Pod Template:
  Labels:  app=nginx-app
  Containers:
   nginx:
    Image:        nginx:1.22.1
    Port:         80/TCP
    Host Port:    0/TCP
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Conditions:
  Type           Status  Reason
  ----           ------  ------
  Available      True    MinimumReplicasAvailable
  Progressing    True    NewReplicaSetAvailable
OldReplicaSets:  <none>
NewReplicaSet:   nginx-deployment-6ddf4f4f4b (4/4 replicas created)
Events:
  Type    Reason             Age    From                   Message
  ----    ------             ----   ----                   -------
  Normal  ScalingReplicaSet  3m39s  deployment-controller  Scaled up replica set nginx-deployment-79f8dcdb98 to 4
  Normal  ScalingReplicaSet  3m28s  deployment-controller  Scaled up replica set nginx-deployment-6ddf4f4f4b to 1
  Normal  ScalingReplicaSet  3m28s  deployment-controller  Scaled down replica set nginx-deployment-79f8dcdb98 to 3 from 4
  Normal  ScalingReplicaSet  3m28s  deployment-controller  Scaled up replica set nginx-deployment-6ddf4f4f4b to 2 from 1
  Normal  ScalingReplicaSet  3m25s  deployment-controller  Scaled down replica set nginx-deployment-79f8dcdb98 to 2 from 3
  Normal  ScalingReplicaSet  3m25s  deployment-controller  Scaled up replica set nginx-deployment-6ddf4f4f4b to 3 from 2
  Normal  ScalingReplicaSet  3m24s  deployment-controller  Scaled down replica set nginx-deployment-79f8dcdb98 to 1 from 2
  Normal  ScalingReplicaSet  3m24s  deployment-controller  Scaled up replica set nginx-deployment-6ddf4f4f4b to 4 from 3
  Normal  ScalingReplicaSet  3m22s  deployment-controller  Scaled down replica set nginx-deployment-79f8dcdb98 to 0 from 1
```

Możemy zauważyć:
`RollingUpdateStrategy: 25% max unavailable, 25% max` - aktualizacja przebiega stopniowo w podanych proporcjach.
`Image: nginx:1.22.1` - jaki aktualnie obraz jest używany

Przywrócenie wczesniejszej wersji obrazu:

```bash
kubectl rollout undo deployment nginx-deployment
```

Wyświetlenie historii:

```bash
kubectl rollout history deployment nginx-deployment
```

Jeśli nowy deployment będzie nieprawidłowy i uruchomi niedziałające kontenry, stare pody nie zostaną podmienione.

Aby zwiększyć ilośc replik dla deploymentu możemy skorzystać z polecenia:

```bash
kubectl scale --replicas=10 deployment nginx-deployment
```

Aby usunąć deployment należy:

```bash
kubectl delete deployment nginx-deployment
```

Usunie to również pody oraz rs należące do deploymentu.

# Job

Są to specjalne pody, które uruchamiają się do momentu wykonania swojego zadania.

Przykładowy plik YAML dla joba:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: odliczanie
spec:
  ttlSeconsAfterFinished: 10 # job zostanie automatycznie usunięty po wykonaniu zadania
  template:
    metadata: # mie wiem czy jest wymagane
      name: odliczanie  # nie wiem czy jest wymagane
    spec:
      containers:
      - name: container-odliczanie
        image: ubuntu
        command: ["bin/bash",  "-c", "for i in 9 8 7 6 5 4 3 2 1; do echo $i; done"]
      restartPolicy: Never # możliwe OnFailure
```

Uruchomione zostaną:

```
NAME                   READY   STATUS      RESTARTS   AGE
pod/odliczanie-njldv   0/1     Completed   0          22s

NAME                   COMPLETIONS   DURATION   AGE
job.batch/odliczanie   1/1           5s         22s
```

Możemy wyświelić szczególowe informaje:

```bash
kubectl describe job/odliczanie
```

output:

```
Name:             odliczanie
Namespace:        default
Selector:         controller-uid=35209704-e60b-4d4a-bee8-4efbd472bd3b
Labels:           controller-uid=35209704-e60b-4d4a-bee8-4efbd472bd3b
                  job-name=odliczanie
Annotations:      batch.kubernetes.io/job-tracking: 
Parallelism:      1
Completions:      1
Completion Mode:  NonIndexed
Start Time:       Mon, 23 Jan 2023 02:18:09 +0000
Completed At:     Mon, 23 Jan 2023 02:18:14 +0000
Duration:         5s
Pods Statuses:    0 Active (0 Ready) / 1 Succeeded / 0 Failed
Pod Template:
  Labels:  controller-uid=35209704-e60b-4d4a-bee8-4efbd472bd3b
           job-name=odliczanie
  Containers:
   container-odliczanie:
    Image:      ubuntu
    Port:       <none>
    Host Port:  <none>
    Command:
      bin/bash
      -c
      for i in 9 8 7 6 5 4 3 2 1; do echo $i; done
    Environment:  <none>
    Mounts:       <none>
  Volumes:        <none>
Events:
  Type    Reason            Age   From            Message
  ----    ------            ----  ----            -------
  Normal  SuccessfulCreate  2m    job-controller  Created pod: odliczanie-njldv
  Normal  Completed         115s  job-controller  Job completed
```

# CronJob

CronJob to obiekt w Kubernetes, który pozwala na automatyczne uruchamianie określonych zadań w określonych odstępach czasu. Jest to przydatne do automatyzacji czynności, takich jak regularne kopiowanie zapasowe, usuwanie starych danych czy też uruchamianie raportów.

YAML dla przykładowego CronJob:

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hello-world-cronjob
spec:
  schedule: "*/1 * * * *" # co minutę
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: hello-world
            image: ubuntu
            command:
            - "/bin/bash"
            - "-c"
            - "echo Hello World!"
          restartPolicy: OnFailure
```

Aby wyświetlić logi z poda:

```bash
kubectl logs hello-world-cronjob-27907354-fcnkz
```

output:

```
Hello World!
```

# Namespace

Namespace to logika izolacji w Kubernetes, która pozwala na tworzenie oddzielnych przestrzeni nazw dla różnych zasobów w klastrze. Dzięki temu, różne zespoły lub projekty mogą używać tych samych nazw dla swoich zasobów bez konfliktu. Podstawowe zasoby Kubernetes mogą być przypisane do konkretnego Namespace. Domyślnie, wszystkie nowo tworzone zasoby są przypisane do "default", ale można tworzyć nowe Namespace i przypisywać do nich zasoby. Na przykład, jeśli masz dwa projekty, "projekt-a" i "projekt-b", możesz utworzyć dwa Namespace: "projekt-a" i "projekt-b" i przypisywać do nich odpowiednie zasoby.

Wyświetlenie utworzonych ns:

```bash
kubectl get ns
```

Aby utworzyć nowy Namespace, możesz użyć polecenia kubectl:

```bash
kubectl create namespace projekt-a
```

Aby przypisać zasób do konkretnego Namespace, możesz dodać opcję `--namespace` do polecenia kubectl:

```bash
kubectl --namespace=projekt-a create -f plik.yaml
```

Aby zobaczyć zasoby przypisane do konkretnego Namespace, możesz użyć polecenia kubectl:

```bash
kubectl get all -n=projekt-a
```

Namespace możemy przypisać podczas tworzenia pliku YAML dla danego obiektu K8s. Musimy pamiętać aby przedtem dany ns był już utworzony.

```yaml
apiVersion: v1
kind: Pod
metadata:
  namespace: projekt-b
  name: nginx-pod #nazwa poda
  labels:
    app: nginx-app
spec: 
  containers:
  - name: strefa-nginx-container #nazwa kontenera
    image: nginx:latest
    ports:
      - containerPort: 80

```

W celu wyświetlenia wszystkich obiektów w ramach wszystkich ns należy dodać flagę `--all-namespaces` .

Aby usunąc namespace (jest on nadrzędny, usuwane zostają wszystkie obiekty przypisane do danego ns):

```bash
kubectl delete ns projekt-a
```

# Zmienne środowiskowe oraz volumes (volumes nie działa xddd)

Aby stworzyć volume typu `hostPath` należy najpierw utworzyć katalog na naszym node poprzez połączenie się dalnie do ssh.]

```bash
❯ kubectl ssh
docker@minikube:~$ sudo mkdir -p /svr/persistent 
```

Zmienne dodajemy w ramach konkretnego kontenera.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ubuntu
  labels:
    name: ubuntu
spec:
  containers:
  - name: ubuntu
    image: ubuntu
    volumeMounts:
      - mountPath: /mntvol
        name: volume-no1
    env:
      - name: MY_LINK
        value: "wp.pl"
    command:
      - "/bin/bash"
      - "-c"
      - "echo $MY_LINK > /mntvol/logs.txt"
    resources:
      limits:
        memory: "128Mi"
        cpu: "500m"
  restartPolicy: Never
  volumes:
    - name: volume-no1
      hostPath:
        path: /srv
        type: Directory
```


# Secrets

Przykładowy yaml dla secret::

login: root
password:dupa123

Dane szyfrujemy poprzez polecenie:

```bash
echo -n "jawny tekst" | base64
```

Przykład yaml dla secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: secret
data:
  user: "cm9vdA=="
  password: "ZHVwYTEyMw=="
stringData:
  jawne: "niezabezpieczone dane"
```

Przykład yaml używającego secret:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secret
  labels:
    name: secret
spec:
  containers:
  - name: secret
    image: ubuntu
    command:
      - "/bin/bash"
      - "-c"
      - "echo $PSS"
    env:
      - name: PSS
        valueFrom:
          secretKeyRef:
            name: secret
            key: password
  restartPolicy: Never
```

---

Zmiana wartości w locie:

```bash
kubectl set image deployment/ubuntu ubuntu=ubuntu:22.01
```

---

# Kopiowanie plików / katalogów

```yaml
# Z poda (-c kontener) do hosta
kubectl cp apache-pod:/var/www/html/index.html /tmp -c <container-name>

# Z hosta do poda
kubectl cp /home/jarek/my_site/index.html apache-pod:/var/www/html/index.html -c <container-name>
```

# Kubespray oraz kubeadm - czyli jak stworzyć klaster K8s

To do...

# Demonset

Deployment i DaemonSet to oba komponenty Kubernetes, które służą do zarządzania i skalowania aplikacji. Różnią się one jednak w sposobie działania i przeznaczeniu.

Deployment jest przeznaczony do zarządzania stanem aplikacji. Pozwala na utrzymywanie określonej liczby replik kontenerów, automatycznie skalując je w razie potrzeby oraz umożliwia wprowadzanie aktualizacji bez przestojów. Deployment jest przeznaczony do aplikacji, które działają na wszystkich nodach lub tylko na niektórych z nich.

DaemonSet natomiast jest przeznaczony do zarządzania kontenerami, które muszą być uruchomione na każdym nodzie w klastrze. DaemonSet zapewnia, że na każdym nodzie zawsze jest uruchomiony określony kontener. Jest to przydatne w przypadku kontenerów, które pełnią funkcję usług wsparcia, takich jak np. kolektory logów, narzędzia monitorowania itp.

W skrócie, Deployment jest przeznaczony do zarządzania aplikacjami, które działają na niektórych nodach, podczas gdy DaemonSet jest przeznaczony do zarządzania usługami wsparcia, które muszą działać na każdym nodzie.

Przykładowy yaml dla demonset:

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: myapp
spec:
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
	  # Sekcja dodatkowa umożliwiająca uruchomienie tylko na node'ach z odpowiadającymi labelami.
	  nodeSelector:
	    test: "true"
	  # -----------------------------------------------------------------------------------------
      containers:
      - name: myapp
        image: <Image>
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: <Port>
```

Aby dodać label do node należy:

```bash
kubectl label nodes <node-name> nazwa=wartość
```


# Etcd - element Kubernetesa 

Jest to serwer bazy danych, który jest odpowiedzialny za przechowywanie i udostępnianie danych dotyczących obiektów zarządzanych przez Kubernetes, takich jak Pody, Deploymenty, Replication Controllery, Services itp.

Dane przechowywane w etcd są dostępne dla wszystkich elementów składowych Kubernetes, co pozwala na ich współdziałanie i koordynację. Na przykład, gdy Deployment tworzy nowe Pod-y, informacje na temat tych Pod-ów są zapisywane w etcd, a inne elementy składowe, takie jak kontrolery replikacji, mogą je odczytać i dostosować swoje działanie odpowiednio.

Etcd jest rozproszony, co oznacza, że dane są replikowane pomiędzy wieloma instancjami, aby zapewnić wysoką dostępność i odporność na awarie. Etcd jest także odpowiedzialny za konsensus w klastrze, co pozwala na koordynację działań między różnymi elementami składowymi Kubernetes.

---

# Statyczne Pody

Statyczne pody są często używane w przypadku aplikacji, które wymagają specjalnego dostosowania lub konfiguracji, które nie mogą być automatycznie zarządzane przez Kubernetes. Na przykład, aplikacja, która wymaga dostępu do prywatnych kluczy lub danych, które nie mogą być przechowywane w etcd.

Tworzenie statycznych podów jest prostsze niż tworzenie Deploymentów, ale nie dają one takiej samej elastyczności w skalowaniu i aktualizacji. W przypadku awarii statycznego podu, administrator musi ręcznie go odtworzyć, zamiast polegać na automatycznej regeneracji przez Kubernetes.

W zależności od potrzeb twojego rozwiązania, statyczne pody mogą być odpowiednie dla pewnych celów, ale w większości przypadków lepiej jest korzystać z Deploymentów, które oferują więcej możliwości zarządzania i skalowania aplikacji.

`/etc/kubernetes/manifests/`

```bash
docker@minikube:~$ ls -lah /etc/kubernetes/manifests/
total 28K
drwxr-xr-x 1 root root 4.0K Jan 22 12:48 .
drwxr-xr-x 1 root root 4.0K Jan 22 13:19 ..
-rw------- 1 root root 2.5K Jan 22 13:19 etcd.yaml
-rw------- 1 root root 4.0K Jan 22 13:19 kube-apiserver.yaml
-rw------- 1 root root 3.4K Jan 22 13:19 kube-controller-manager.yaml
-rw------- 1 root root 1.5K Jan 22 13:19 kube-scheduler.yaml
```

Kubernetes domyślnie posiada statyczne pody dla swoich komponentów klastra, jak etcd, kube-apiserver, kube-controller-manager i kube-scheduler, które są niezbędne do działania klastra Kubernetes. Służą one do zarządzania konfiguracją i stanem klastra oraz umożliwiają komunikację między poszczególnymi elementami składowymi Kubernetes. Te pody są statyczne i nie są zarządzane przez Deploymenty czy inne kontrolery stanu, ponieważ są to komponenty klastra, które muszą być zawsze dostępne i działać poprawnie.

Po usunięciu poprzez `kubectl delete` pod ponownie zostanie uruchomiony, możliwością jego usunięcia jest skasowanie pliku yaml z lokalizacji ../manifests

# Init

Init container to specjalny rodzaj kontenera, który jest uruchamiany przed głównym kontenerem w Pod-zie w Kubernetes. Init container jest używany do wykonania określonych czynności przed uruchomieniem głównego kontenera, takich jak: przygotowanie środowiska, pobranie zależności, przygotowanie danych, sprawdzenie warunków, itp. Init container jest zatrzymywany po wykonaniu swoich zadań i nie jest uruchamiany ponownie. Główny kontener, który jest uruchamiany po init containerze, ma dostęp do wszystkich przygotowanych danych i środowiska. Możliwe jest użycie wielu init containerów w jednym Pod-ie, które są uruchamiane w kolejności według konfiguracji. Każdy init container musi być zatwierdzony przed uruchomieniem następnego. Jeśli jeden z init containerów kończy działanie z statusem błędu, cały Pod jest oznaczany jako niepowodzenie i jest automatycznie usuwany przez Kubernetes.

Initi container jest też używany do implementacji różnych rozwiązań, takich jak:
-   Inicjalizacja bazy danych
-   Pobranie kluczy prywatnych z sekretów
-   Wczytanie pliku konfiguracyjnego
-   Sprawdzanie dostępności zewnętrznych zasobów

Dzięki init containerom, można zwiększyć elastyczność i skalowalność aplikacji oraz uniknąć konieczności umieszczania dodatkowych skryptów w obrazie kontenera.

Init container jest definiowany w pliku konfiguracji Pod-a jako dodatkowy element w sekcji spec.containers. Mo

Przykładowy yaml z użyciem init containera:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: strefakursow-nginx
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
    # W ten sposób wskazujemy init conatiner
      initContainers:
      - name: clean-and-download
        image: praqma/network-multitool
        command: [ "sh", "-c", "rm -rf /www/* && wget https://gitlab.com/helppointit/strefa-kursow-kubernetes-podstawy/-/raw/master/html_example/index.html -O /www/index.html && wget https://pbs.twimg.com/profile_images/1108330399539830784/gSJjEUVx.png -O /www/obrazek.png && wget https://gitlab.com/helppointit/strefa-kursow-kubernetes-podstawy/-/raw/master/repo.zip?inline=false -O /www/repo.zip && mkdir /www/repo && ls -la /www" ]
        volumeMounts:
        - mountPath: /www
          name: http-content
      - name: unzip
        image: garthk/unzip
        command: [ "unzip", "/www/repo.zip", "-d", "/www/repo"]
        volumeMounts:
        - mountPath: /www
          name: http-content
      - name: clear
        image: ubuntu
        command: [ "sh", "-c", "rm -f /www/repo.zip" ]
        volumeMounts:
        - mountPath: /www
          name: http-content
    # Tutaj opisujemy kontenery, które uruchomią się po poprawnym uruchomieniu init containerów
      containers:
      - name: hosting-strefakursow
        image: nginx
        volumeMounts:
        - mountPath: /usr/share/nginx/html/
          name: http-content
      volumes:
      - name: http-content
        hostPath:
          path: /tmp/www-content
          type: DirectoryOrCreate
```

# Port forwarding

Port forwarding w Kubernetes pozwala na przekierowanie ruchu sieciowego z hosta na pojedynczy kontener lub cały Pod w klastrze. Dzięki port forwarding, możliwe jest dostęp do aplikacji uruchomionej wewnątrz klastra z zewnątrz, bez konieczności udostępnienia bezpośredniego dostępu do hosta.

Aby skonfigurować port forwarding w Kubernetes, należy użyć polecenia `kubectl port-forward`. Polecenie to pozwala na przekierowanie ruchu z określonego portu hosta na określony port w kontenerze. Możliwe jest też przekierowanie ruchu na cały Pod, a nie tylko na jeden kontener.

Przykład:

```bash
kubectl port-forward pod/my-pod 8080:80
```

Powyższy przykład przekierowuje ruch z portu 8080 na hostie na port 80 w kontenerze my-pod

Port forwarding jest przydatne w przypadku, gdy chcesz udostępnić dostęp do aplikacji np. dla celów testowania, debugowania lub dostępu dla użytkowników.

Uwaga: konfiguracja port forwarding jest tymczasowa i po zakończeniu działania polecenia, przekierowanie przestaje działać.

# Services, endpoints

Przykład yaml:

- deployment nginx z udostępnionym portem 80:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx
        resources:
          limits:
            memory: "128Mi"
            cpu: "500m"
        ports:
        - containerPort: 80
```

- service, który podpina się do kontenera dzięki czemu będziemy mogli się komunikować  między kontenerami nie za pomocą IP, a można powiedzieć "nazwy domenowej", która zawsze będzie przypisana do tego poda niezależnie jaki adres sieci dostanie.

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
  - port: 80
```

Endpoint w Kubernetes to obiekt reprezentujący adres IP i port dla jednego lub wielu kontenerów w klastrze. Endpointy służą do konfiguracji usług (Services) w klastrze, które pozwalają na dostęp do kontenerów z innych elementów składowych klastra.

Usługa (Service) jest abstrakcją pozwalająca na dostęp do grupy podów przez określony adres IP i port. Dzięki usłudze, wszystkie pody w grupie mogą być udostępnione przez jeden adres IP i port, co pozwala na łatwiejsze zarządzanie dostępnością aplikacji i skalowanie. Endpointy służą do mapowanie adresów IP i portów podów na adres IP i port usługi.

Przykład:

-   Mamy 3 pody z aplikacją na adresach IP: 10.0.0.1, 10.0.0.2, 10.0.0.3 i portem 8080
-   Tworzymy usługę o nazwie "my-service" z adresem IP 10.0.0.4 i portem 80
-   Tworzymy endpointy dla każdego z podów:
    -   endpoint dla podu 1 z adresem IP 10.0.0.1 i portem 8080
    -   endpoint dla podu 2 z adresem IP 10.0.0.2 i portem 8080
    -   endpoint dla podu 3 z adresem IP 10
    -   endpoint dla podu 3 z adresem IP 10.0.0.3 i portem 8080

Teraz, gdy ktoś wysyła zapytanie do usługi "my-service" na adresie IP 10.0.0.4 i porcie 80, Kubernetes automatycznie przekieruje ruch na jeden z podów, którego endpoint jest skonfigurowany w usłudze. Dzięki temu, aplikacja jest dostępna przez jeden adres IP i port, niezależnie od tego ile podów jest uruchomionych.

Endpointy pozwalają na elastyczne skalowanie aplikacji oraz zapewniają wysoką dostępność poprzez automatyczne przekierowywanie ruchu do dostępnych podów.

Sprawdźmy jak wygląda to przy wyświetleniu naszych obiektów:

```bash
# k get pod -o wide
NAME                         READY   STATUS      RESTARTS   AGE    IP           NODE       NOMINATED NODE   READINESS GATES
nginx-6d99f84b48-gc2s4       1/1     Running     0          36s    172.17.0.7   minikube   <none>           <none>

# k get services -o wide
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE     SELECTOR
nginx        ClusterIP   10.98.230.188   <none>        80/TCP    28s     app=nginx

# k get endpoints -o wide
NAME         ENDPOINTS           AGE
nginx        172.17.0.7:80       35s
```

# NodePort

NodePort w Kubernetes to rodzaj usługi (Service), która pozwala na dostęp do aplikacji z zewnątrz klastra poprzez określony port na każdym z węzłów (node) klastra. NodePort udostępnia jeden port na każdym z węzłów klastra, który jest mapowany na port wewnętrzny w kontenerze.

Dzięki NodePort, aplikacja jest dostępna przez jeden port na każdym z węzłów, co pozwala na łatwiejsze zarządzanie dostępnością aplikacji i skalowanie.

Konfigurując NodePort, należy podać zakres portów, z których będzie losowo przydzielany port dla usługi.

Przykład:

-   Tworzymy usługę typu NodePort o nazwie "my-service" z portem wewnętrznym 80
-   Określamy zakres portów 30000-32767
-   Usługa "my-service" będzie dostępna na każdym z węzłów przez losowo przydzielony port z zakresu 30000-32767, np. 30500

NodePort jest przydatny gdy chcesz udostępnić aplikację z zewnątrz klastra, ale nie chcesz udostępniać dostępu do hostów, jednocześnie nie chcesz też korzystać z rozwiązań typu LoadBalancer.

# LoadBalancer

działa tylko na externalowych rozwiązaniach chmurkowych ☁

---

statefulset vs daemonset

aplikacje bezstanowe 

---

# Volume

##### Istnieje kilka typów wolumenów w Kubernetes:
1. Wolumin hosta: pozwala na użycie dysku lub innego nośnika danych znajdującego się na hostie, na którym znajduje się kontener.
2. Wolumin configMap: pozwala na dostęp do plików konfiguracyjnych zapisanych w Kubernetes.
3. Wolumin secret: pozwala na dostęp do tajnych danych, takich jak hasła i klucze API.
4. Wolumin Persistent Volume (PV) i Persistent Volume Claim (PVC): pozwala na zarządzanie danymi w sposób trwały i zapewnia ciągłość działania aplikacji.
5. Wolumin NFS: pozwala na dostęp do zasobów zapisanych na serwerze NFS.
6. Wolumin volume plug-in : pozwala na dostęp do różnych rodzajów magazynów danych, takich jak Azure Disk, GCE Persistent Disk, iSCSI itp.

##### 1. Wolumin hosta:
pozwala na użycie dysku lub innego nośnika danych znajdującego się na hostie, na którym znajduje się kontener. Jest to przydatne, jeśli chcesz udostępnić plik lub katalog z hosta kontenerowi. Przykład:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-storage
      mountPath: /data
  volumes:
  - name: myapp-storage
    hostPath:
      path: /data
```

##### 2. Wolumin configMap:
pozwala na dostęp do plików konfiguracyjnych zapisanych w Kubernetes. Jest to przydatne, jeśli chcesz oddzielić konfigurację od kodu aplikacji. Przykład:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: myapp-config
data:
  config.properties: |-
    app.name=MyApp
    app.version=1.0
---
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-config
      mountPath: /etc/config
  volumes:
  - name: myapp-config
    configMap:
      name: myapp-config
```

##### 3. Wolumin secret:
pozwala na dostęp do tajnych danych, takich jak hasła i klucze API. Jest to przydatne, jeśli chcesz chronić wrażliwe dane przed dostępem nieupoważnionych osób. Przykład:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: myapp-secret
data:
  api.key: c2VjcmV0IGtleQ==
  password: cGFzc3dvcmQ=
---
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-secret
      mountPath: /etc/secret
  volumes:
  - name: myapp-secret
    secret:
      secretName: myapp-secret
```

##### 4. Wolumin Persistent Volume (PV) i Persistent Volume Claim (PVC):
pozwala na zarządzanie danymi w sposób trwały i zapewnia ciągłość działania aplikacji. PV jest fizycznym nośnikiem danych, natomiast PVC to abstrakcja, która pozwala na korzystanie z PV. Przykład:

PersistentVolume (PV) to część magazynu w klastrze, która została zainicjowana przez administratora. Jest zasobem w klastrze, podobnie jak węzeł jest zasobem klastra. PV to wtyczki volumenów, takie jak Volumes, ale mają cykl życia niezależny od każdego indywidualnego poda, który korzysta z PV.

PersistentVolumeClaim (PVC) to żądanie przechowywania przez użytkownika. Jest podobny do strąka. Pody zużywają zasoby węzłów, a obwody PVC zużywają zasoby PV. Pody mogą żądać określonych poziomów zasobów (procesora i pamięci). Oświadczenia mogą wymagać określonego rozmiaru i trybów dostępu (np. mogą być montowane raz do odczytu/zapisu lub wielokrotnie tylko do odczytu).

```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: myapp-pv
spec:
  capacity:
    storage: 5Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/myapp
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: myapp-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 2Gi
  selector:
    matchLabels:
      app: myapp
---
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-storage
      mountPath: /data
  volumes:
  - name: myapp-storage
    persistentVolumeClaim:
      claimName: myapp-pvc
```

##### 5. Wolumin NFS:
pozwala na dostęp do zasobów zapisanych na serwerze NFS. Jest to przydatne, jeśli chcesz udostępnić pliki z jednego serwera wielu kontenerom. Przykład:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-nfs
      mountPath: /data
  volumes:
  - name: myapp-nfs
    nfs:
      server: nfs-server
      path: /exported/path
```

##### 6. Wolumin volume plug-in:
pozwala na dostęp do różnych rodzajów magazynów danych, takich jak Azure Disk, GCE Persistent Disk, iSCSI itp. Przykład dla Azure Disk:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp-pod
spec:
  containers:
  - name: myapp-container
    image: busybox
    command: ['sh', '-c', 'echo Hello Kubernetes! && sleep 3600']
    volumeMounts:
    - name: myapp-azuredisk
      mountPath: /data
```
