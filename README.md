# Carrom Corner

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

This application is an Angular 5 node.js application which uses a mock API to query a SQL server. 

INSTRUCTIONS TO RUN LOCALLY

get a local mySQL server up and running with the schema. Configure db.js with your connection parameters. Start the node server by running "node server.js" in a command window. Serve the project in another window using ng serve --proxy-config proxy.conf.json. HTTP requests will be proxied with this configuration to allow the local mock API found in the /api directory to do it's work. 

navigate to localhost:4200 to use the app.

# Key Functionality:

1. Players

Add players to the application and begin tracking their carrom-related stats. The application ranks players based on singles,    doubles, and total stats. 

2. Tournaments

Create singles and doubles tournaments with the players you add. The tournament can be configured to have one or two rounds, as well as a single or double round-robin game set. 
    
3. Pools

Players will be automatically distributed into pools. Click on a pool to view its set of games. Click a game on the graph to enter its result, and have it reflected in the calculated standings of each pool.
    
4. Brackets

   Once the playoffs begin, the players you advance will be seeded, and a bracket will be constructed dynamically based on the amount of players you have advanced. Click a node on the bracket to enter a result for that game. Once a winner has been declared, clicking "End Tournament" will officially end the tournament and declare the winner.
   
5. Stats

Several global stats sourced from all players can be viewed on the "Stats" tab.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
