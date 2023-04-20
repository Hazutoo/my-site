### Portainer

https://docs.portainer.io/start/install/server/docker/linux

Portainer is a web-based interface for managing Docker containers, images, and volumes. It provides a user-friendly dashboard for monitoring and controlling containerized applications. With Portainer, you can deploy, start, stop, and remove containers, as well as manage networks and storage. The platform also offers a variety of features such as access control, backup and restore, and resource usage statistics. Overall, Portainer simplifies the management of Docker environments and makes it accessible to users of all skill levels.

![[Pasted image 20230417112927.png]]
https://www.portainer.io/hubfs/Edge%20Aug22/edge-mockup.png

	Zarówno Portainer, jak i Rancher pozwalają na zarządzanie kontenerami w systemach opartych na Dockerze, a Portainer oferuje interfejs graficzny, który ułatwia zarządzanie kontenerami dla użytkowników, którzy nie są zaznajomieni z linii poleceń Docker. Natomiast Rancher oferuje dodatkowe funkcjonalności, w tym zarządzanie klastrami kontenerów na wielu maszynach, automatyzację konfiguracji i skalowanie aplikacji oraz narzędzia do monitorowania i rejestrowania aplikacji. W związku z tym, jeśli potrzebujesz prostego narzędzia do zarządzania kontenerami w systemie Docker, Portainer może być dobrym wyborem, natomiast jeśli potrzebujesz bardziej zaawansowanych funkcji, takich jak skalowanie i zarządzanie klastrami, Rancher może być lepszym wyborem.

### Rancher

![[Pasted image 20230417115951.png]]
https://www.suse.com/c/wp-content/uploads/2022/03/Screen-Shot-2022-03-23-at-10.47.20-AM.png

Both Portainer and Rancher allow for managing containers in Docker-based systems, and Portainer offers a graphical user interface that makes container management easier for users who are not familiar with Docker command line. Meanwhile, Rancher offers additional features, including managing container clusters across multiple hosts, automating application configuration and scaling, and tools for monitoring and logging applications. Therefore, if you need a simple tool for managing containers in Docker, Portainer may be a good choice, while if you need more advanced features such as scaling and cluster management, Rancher may be a better choice.

#### Installation with docker image

https://ranchermanager.docs.rancher.com/v2.5/pages-for-subheaders/rancher-on-a-single-node-with-docker