#!/bin/bash

if [[ $* == *-v* ]]; then
   npm run buildv --verbose
else 
   npm run build
fi
