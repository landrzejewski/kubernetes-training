## Konfiguracja VirtualBox

- Wyłącz Hyper-V (wykonaj z PowerShell)
```
bcdedit /set hypervisorlaunchtype off
```
- Wejdź w menu Plik->Narzędzia->Network manager
- Stwórz nową sieć NAT i nazwij ją `kubernetes`
- Skonfiguruj stworzoną sieć
    - Adres sieci: 192.168.1.0/24
    - Reguły przekierowania portów:

| Nazwa  |  Protokół  |  IP hosta   | Port hosta |   IP gościa   | Port gościa |
|:------:|:----------:|:-----------:|:----------:|:-------------:|:-----------:|
| Rule 1 |    TCP     |  127.0.0.1  |   10022    | 192.168.1.100 |     22      |
| Rule 2 |    TCP     |  127.0.0.1  |   10023    | 192.168.1.10  |     22      |
| Rule 3 |    TCP     |  127.0.0.1  |   10024    | 192.168.1.11  |     22      |
| Rule 4 |    TCP     |  127.0.0.1  |   10025    | 192.168.1.12  |     22      |

## Przygotowanie maszyny base

- Skonfiguruj nową maszynę:
    - Nazwa: Debian
    - Typ/Wersja: Debian (64-bit)
    - Pamięć RAM: 4096 MB
    - Procesor: 2 CPU
    - Dysk twardy: 512 GB, dynamicznie przydzielany
    - Karta sieciowa: Sieć NAT o nazwie `kubernetes`
- Zainstaluj system Debian
    - Hasło root: k8s
    - Użytkownik: k8s
    - Hasło: k8s
    - Nazwa hosta: debian
    - Pakiety do zainstalowania:
        - Server SSH
        - Podstawowe narzędzia systemowe
- Wyłącz cd/dvd jako źródło pakietów - usuń linię rozpoczynającą się od `deb cdrom`
```
nano /etc/apt/sources.list
```
- Zaktualizuj system i zainstaluj podstawowe narzędzia
```
apt update 
```
```
apt install sudo net-tools curl git
```
- Dodaj użytkownika k8s do grupy sudo
```
usermod -aG sudo k8s
```
- Wyłącz dhcp i ustaw stały adres IP
```
sudo nano /etc/network/interfaces
```
```
# iface enp0s3 inet dhcp
iface enp0s3 inet static
      address 192.168.1.100
      netmask 255.255.255.0
      gateway 192.168.1.1
```
# Instalacja klastra
- Sklonuj maszynę bazową i nadaj jej nazwę master
```
sudo hostnamectl set-hostname master
```
- Wyłącz swap
```
swapoff -a
```
```
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
```
- Dodaj do źródeł pakietów gałąź eksperymentalną i zainstaluj aktualny Containerd 
```
echo "deb http://ftp.ca.debian.org/debian sid main" >> /etc/apt/sources.list
```
```
sudo apt update
```
```
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```
```
sudo apt install containerd=1.6.16~ds1-1
```
```
containerd config default | sudo tee /etc/containerd/config.toml >/dev/null 2>&1
```
- Zmień plik `/etc/containerd/config.toml` w sekcji `[plugins.”io.containerd.grpc.v1.cri”.containerd.runtimes.runc.options]` 
ustawiając `SystemdCgroup = true`
```
sudo systemctl restart containerd
```
```
sudo systemctl enable containerd
```
- Zainstaluj narzędzia Kubernetes
```
sudo apt install gnupg gnupg2 curl software-properties-common -y
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmour -o /etc/apt/trusted.gpg.d/cgoogle.gpg
sudo apt-add-repository "deb http://apt.kubernetes.io/ kubernetes-xenial main"
sudo apt update
sudo apt install kubelet kubeadm kubectl -y
sudo apt-mark hold kubelet kubeadm kubectl
```
- Ustaw adress IP
```
sudo nano /etc/network/interfaces
```
```
# iface enp0s3 inet dhcp
iface enp0s3 inet static
      address 192.168.1.10
      netmask 255.255.255.0
      gateway 192.168.1.1
```
- Zdefiniuj adresy pozostałych maszyn
```
sudo nano /etc/hosts
```
```
192.168.1.10 master    
192.168.1.11 node1    
192.168.1.12 node2    
```
- Sklonuj maszynę master dwa razy i ustaw nazwy oraz adresy IP dla node1 i node2
- Zainicjuj klaster na maszynie master
```
sudo kubeadm init --control-plane-endpoint=master
```
```
mkdir -p $HOME/.kube
```
```
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
```
```
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
- Dołącz pozostałe maszyny (node1, node2) postępując zgodnie z wyświetlaną instrukcją
- Zainstaluj warstwę sieciową
```
kubectl apply -f https://projectcalico.docs.tigera.io/manifests/calico.yaml
```
- Pozwól na logowanie użytkownika root na maszynie master
```
nano /etc/ssh/sshd_config  (ustawić PermitRootLogin yes)
```
```
/etc/init.d/ssh restart
```
- Sklonuj maszynę bazową i ustaw nazwę i adres IP dla admin
- Zainstaluj kubectl https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
```
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
```
```
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```
- Skopiuj konfigurację z maszyny master
```
mkdir ~/.kube
```
```
scp root@192.168.1.10:/etc/kubernetes/admin.conf ~/.kube/local
```
```
echo export KUBECONFIG=~/.kube/local >> ~/.bash_profile
```
- Dodaj ładowanie .bashrc w .bash_profile
```
if [ -f "$HOME/.bashrc" ]; then
   . "$HOME/.bashrc"
fi
```
- Skonfiguruj bash completion
```
echo "source <(kubectl completion bash)" >> ~/.bashrc
```
```
source .bash_profile
```
# Inne
- Wyświetlenie wszystkich logów na Master
```
journalctl -u kubelet --no-pager|less
```
- Opcjonalna wymiana certyfikatu jeśli nie użyliśmy --apiserver-cert-extra-sans
```
rm /etc/kubernetes/pki/apiserver.*
kubeadm phase certs all --apiserver-advertise-address=0.0.0.0 --apiserver-cert-extra-sans=x.x.x.x,x.x.x.x
docker rm -f `docker ps -q -f 'name=k8s_kube-apiserver*'`
systemctl restart kubelet
```
- Opcjonalnie wyświetlenie tokenów
```
kubeadm token list
```
- Fix
```
unset http_proxy
unset https_proxy
```
