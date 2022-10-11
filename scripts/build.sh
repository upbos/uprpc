#! /bin/bash

echo -e "Start running the script..."
export PATH=/usr/local/go/bin:$GOPATH/bin:$PATH
echo -e "PATH:" $PATH
cd ../

echo -e "Start building the app..."
wails build --clean --platform $1

echo -e "End running the script!"
