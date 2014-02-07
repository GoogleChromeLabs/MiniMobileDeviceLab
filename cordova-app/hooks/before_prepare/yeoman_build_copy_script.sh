#!/bin/bash
 
echo "Building Grunt Project.";
cd ./yeoman/;
grunt build;
cd ../;
 
echo "Deleting files in ./www";
rm -rf ./www/*;
 
echo "Copying files from ./yeoman/dist to ./www";
cp -r ./yeoman/dist/* ./www/;
