#!/bin/bash

host="192.168.126.25"
port="54011"

dmp="/data/webserver/itcase/install"
tm=$(date "+%Y.%m.%d-%H.%M.%S")
echo Dump started on $tm

/usr/bin/psql -h $host -p $port -d itcase -U postgres -f $dmp/itcase.sql
echo Dump upload finished on $(date "+%Y.%m.%d-%H.%M.%S")

