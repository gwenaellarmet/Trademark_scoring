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

## CRUD for documents

Same things as before; seems that it will be the heaviest controller of the project.
For now, validation/classification/scoring is not handle but will be next step; TODO has been added all over


## Classification service

Used some regex to check content and title for a match, we concat the title at the start of the content to slash the regex matching process by 2.

## Validation function

The issue here is that I need the trademark title which I don't have directly from the document; I need a getTrademarkbyId function independant from the trademark controller
(not important note but by copy/pasting the rule; I just found out that it's ok to have emoji in ts comments... which is cool to know)
The function was added in a new trademark service

## Scoring function

That's the big one. Was easier to split it into 3 function each scoring their part.
There is a design issue with the time coverage part: time doesn't stop so score is changing; some kind of cron need to exist in order to keep the score up to date; this won't be done in this project as it won't be deployed but it need to be kept in mind (except if we succeed in stopping time, but then we have other kind of issues)
We only expose the top functions in the service; might extract the scoring logic into a different logic at some point, but for now it'll do since trademarkService is not that big