#!/bin/bash

cd "$(dirname "$0")"

cd webapp

npm install

npm run build
