#!/bin/bash

#run in carrom-corner directory
systemctl start mysql
node server.js &
npm run local
