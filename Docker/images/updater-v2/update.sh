#!/bin/bash
mkdir -p /var/htdocs
while :
do 
  date >> /var/htdocs/index.html
  sleep $INTERVAL
done
