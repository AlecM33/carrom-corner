# CarromApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

In its current state, the application makes mock REST calls to a .json file using a service called json-server. I would recommend readig the docs on this service if you run into any problems manipulating the .json file as a database. To run the application, first install json-server. After this, you'll need two command windows. In one, start the server with 

`json-server db.json`

This will activate the database stored in db.json.

and run `ng serve` in the other. 

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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
