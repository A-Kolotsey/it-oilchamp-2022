#!/bin/bash

host="192.168.126.25"
port="54011"

dmp="/data/webserver/itcase/install"
tm=$(date "+%Y.%m.%d-%H.%M.%S")
echo Dump started on $tm

/usr/bin/pg_dump -h $host -p $port -O -F p -c -U postgres itcase -f $dmp/itcase.sql
echo Dump create finished on $(date "+%Y.%m.%d-%H.%M.%S")

/usr/bin/7z a -sdel $dmp/itcase-$tm.7z $dmp/itcase.sql
echo Dump pack finished on $(date "+%Y.%m.%d-%H.%M.%S")

