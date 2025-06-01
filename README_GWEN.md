# Personnal notes

This file will be used to take some notes during the project
I'll clean it and add my tought on the project at the end

## First setup

I installed and init express / sqlite / typescript / jest with default settings before pushing the first commit
I also added some utils ( nodemon ) for easier dev time and set up all my npm commands
And to finish up; added the minimal to get the server up and running, as well as a dummy test to check if jest is working as intended

## Setting up models

Not much to say here; I used the definition given in the README_EN and added the DocumentType type to check if it's one of the allowed type

## Setting up sqlite3

Created the database and table creation scripts; Added score into the base to avoid calculating eachtime

## CRUD for trademarks

Basic Create/Read/Update/Delete functions for a controller; the sql query might have to move into a service later. I did added the multiple/single READ function, usual API settup.
And Added a router for the trademarks as well
Had some weird issue with typing from express 5; reverted to 4 for now, but will dig into this issue when I'm not into time pressure.
Added some TODO comment for next steps


