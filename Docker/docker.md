Uzyskanie pomocy na temat polecenia
```
docker help ps
```
Wyświetlenie listy dostępnych obrazów
```
docker images
```
Pobranie obrazu do lokalne repozytorium (REGISTRYHOST:PORT/USERNAME/NAME:TAG)
```
docker pull landrzejewski/echo-server
```
Uruchamianie kontenera
```
docker run [--name] [--detach] busybox echo "Hello"
```
Sprawdzenie działających kontenerów
```
docker ps
```
Wyświetlenie kontenerów, w tym zatrzymanych
```
docker ps -a
```
Zatrzymanie kontenera
```
docker stop id/nazwa
```
Usunięcie zatrzymanego kontenera
```
docker rm id/nazwa
```
Usunięcie wszystkich kontenerów
```
docker rm $(docker ps -a -q)
```
Uruchomienie kontenera z przekierowaniem portów
```
docker run -p 8080:8080 landrzejewski/echo-server
```
Wyświetlenie logów
```
docker logs id/nazwa
```
Uruchomienie procesu w działającym kontenerze
```
docker exec [-it] id/nazwa polecenie
```
Restart kontenera
```
docker restart id/nazwa
```
Utworzenie kontenera bez jego wystartowania
```
docker create [--cidfile nazwa-pliku] obraz 
```
Uruchomienie stworzonego kontenera
```
docker start id/nazwa 
```
Wyświetlenie informacji o kontenerze
```
docker inspect id/naza
```
Eksportowanie obrazu do pliku tar
```
docker save -o naza-pliku.tar nazwa-obrazu:tag
```
Usuwanie obrazu z lokalnego repozytorium
```
docker rmi id/nazwa
```
Importowanie obrazu do lokalnego repozytorium
```
docker load -i nazwa-pliku.tar
```
Uruchomienie rejestru obrazów kontenerów
```
docker run -d -p 5000:5000 --restart always --name registry registry:2
```
Dodanie tagu/aliasu do obrazu 
```
docker tag nazwa-obrazu nazwa-hosta-repozytrium:port/nazwa-obrazu
```
Dodanie obrazu do zewnętrznego repozytorium
```
docker push nazwa-hosta-repozytrium:port/nazwa-obrazu
```
Pobranie obrazu z zewnętrznego repozytorium
```
docker pull nazwa-hosta-repozytrium:port/nazwa-obrazu
```
Montowanie wolumenu (tyb bind)
```
docker run -p 8080:8080 --mount type=bind,src=/home/k8s/data,dst=/app/data,readonly=true landrzejewski/echo-server
```
Montowanie wolumenu (tyb tmpfs)
```
docker run -p 8080:8080 --mount type=tmpfs,dst=/app/data landrzejewski/echo-server
```
Ustawianie zmiennych środowiskowych/konfiguracja kontenera z zewnątrz
```
docker run -p 5432:5432 \
    -e POSTGRES_DB=training \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    --mount type=bind,src=/home/k8s/data/db,dst=/var/lib/postgresql/data/pgdata \
    postgres
```
Utworzenie globalnego wolumenu
```
docker volume create --driver local --label training storage
```
```
docker volume inspect storage
```
```
docker run -p 5432:5432 \
    -e POSTGRES_DB=training \
    -e POSTGRES_USER=admin \
    -e POSTGRES_PASSWORD=admin \
    -e PGDATA=/var/lib/postgresql/data/pgdata \
    --volume storage:/var/lib/postgresql/data/pgdata \
    postgres
```
Utworzenie sieci
```
docker network create \
    --driver bridge \
    --subnet 10.0.1.0/24 \
    --attachable \
    training
```
```
docker run -p 8080:8080 --network training landrzejewski/echo-server
```
```
docker network create \
    --driver bridge \
    --subnet 10.0.2.0/24 \
    --attachable \
    training2
```
```
docker network connect training2 70e5472bffd4
```
Tworzenie obrazu poprzez pracę z kontenerem i modyfikację istniejącego obrazu
```
docker run -d landrzejewski/echo-server
```
```
docker exec -it id/name sh
```
Wprowadzamy zmiany np. instalujemy dodatkowe pakiety i dalej zapisujemy w formie nowego obrazu
```
docker container commit id/name nowa_nazwa_obrazu
```
Budowanie obrazu na podstawie pliku Dockerfile
```
docker image build --tag landrzejewski/echo .
```
Serwisy
```
docker swarm init
```
```
docker swarm join --token SWMTKN-1-60racgd05909k8iq873t43x6cjn0397nq2lqxj1sidqxg6z159-45wzkndc3ejsub3a0wpkmn7iq 192.168.1.100:2377
```
```
docker service create -p 8080:8080 --name echo-server landrzejewski/echo-server
```
```
docker service ps echo-server
```
```
docker service scale echo-server=3
```
```
docker service update --image landrzejewski/echo-server:v1 --update-order stop-first --update-parallelism 1 --update-delay 30s echo-server
```
Serwisy deklaratywnie
```
docker compose up [nazwa-serwisu]
```
```
docker compose down
```
```
docker stack deploy --compose-file docker-compose.yml my-stack
```
```
docker stack rm my-stack
```
```
docker build --platform linux/x86_64 --tag landrzejewski/platform .
```




