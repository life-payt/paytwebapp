#!/bin/bash

# Author: University of Aveiro
# Co-funded by the EU LIFE Programme with the reference LIFE15 ENV/PT/609

cd "$(dirname "$0")"

cd webapp

npm install

npm run build
