# SETUP

This repository host the Mongodb Docker setup. We are using Docker container to host Mongodb.

Mongodb will use mongodb-data folder to store its files. This will help us to preserve data even when the container is down.

Mongodb credentials are stored inside docker-compose yaml file.

## System Requirements

memory 1 GB (4 GB recommended)

disk space 10 GB (50 GB recommended)

Docker CE

# RUN

Open a terminal and run

```
sudo docker-compose up -d
```

On windows

```
docker-compose up -d
```

# MongoDB Client (Mongo Express)

Mongodb client is also installed with this setup. After running docker containers, you will be able to find the client at

http://localhost:8085/ 

username/passwords are stored inside docker-compose.yml file

ME_CONFIG_BASICAUTH_USERNAME/ME_CONFIG_BASICAUTH_PASSWORD
