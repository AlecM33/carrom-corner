import { Component, OnInit, DoCheck } from '@angular/core';
import { AppComponent } from '../app.component';
import { NgModel, Form, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { AddPlayerComponent } from '../Players/add-player.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { PlayerService } from '../Services/player.service';
import { HttpClient } from '@angular/common/http';
import { Player } from '../Players/player';
import { TournamentService } from '../Services/tournament.service';
import { Observable } from 'rxjs/Observable';
import { Tournament } from './tournament';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SinglesPool } from '../Pools/singles-pool';
import { Game } from '../Games/game';
import { GameService } from '../Services/game.service';
import { reduceEachTrailingCommentRange } from 'typescript';
import {DoublesTournament} from './doubles-tournament';
import {SinglesTournament} from './singles-tournament';
import {TournamentSetupService} from '../Services/tournament-setup.service';
import {toArray} from 'rxjs/operators';
import {Team} from '../Teams/team';


/* Component for creating a singles tournament. Includes functions for presenting setup parameters
and for generating the pools and schedule */
@Component({
  templateUrl: 'add-tournament.component.html'
})
export class AddTournamentComponent implements OnInit {
  constructor(private _playerService: PlayerService,
              private _tournyService: TournamentService,
              private http: HttpClient,
              private router: Router,
              public active_route: ActivatedRoute,
              private _gameService: GameService,
              private _setupService: TournamentSetupService) {
  }

  public playersInTourny = new Set<Player>();
  public playersToAdd = new Set<Player>();
  public teamIds = [];
  public doublesTeamIds = [];
  public tournyType = 'singles';
  public maxSize: number;
  public players = [];
  public tournament: any;
  public numberOfRounds = 1;
  public optimalGroupSize: number;
  public sameSizePools: number;
  public robinType = 'Single';
  public oneRound = true;
  public singleRoundRobin = true;
  public generatedPools = [];
  public scheduleIndices = [];
  public tournamentName: string;
  public id = 0;
  public errorPresent = false;


  nameBlank = false;
  nameForbidden = false;
  rosterForbidden = false;
  rosterUneven = false;
  nameFormatInvalid = false;

  ngOnInit () {
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });

    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.maxSize = players.length;
      for (let player of this.players) {
        this.playersToAdd.add(player);
      }
    });
  }

  tournamentValidator() {
    this.nameBlank = !this.tournamentName;
    this.nameFormatInvalid = this.tournamentName && !(/^[a-zA-Z0-9 ]*$/).test(this.tournamentName);
    if (this.tournyType === 'doubles') {
      this.rosterUneven = this.playersInTourny.size % 2 !== 0;
    } else {
      this.rosterUneven = false;
    }
    this.rosterForbidden = this.playersInTourny.size < 2;
    if (!this.rosterForbidden && !this.nameBlank && !this.rosterUneven) {
      this.createTourny();
    } else {
      this.errorPresent = true;
    }
  }

  // Adds player to current working roster
  addPlayer(currentPlayer: Player) {
    this.playersInTourny.add(currentPlayer);
    this.teamIds.push(currentPlayer.id);
    this.playersToAdd.delete(currentPlayer);
  }

  // Removes player from current working roster
  removePlayer(currentPlayer: Player) {
    this.playersInTourny.delete(currentPlayer);
    this.playersToAdd.add(currentPlayer);
    const index = this.teamIds.findIndex((id) => id === currentPlayer.id);
    this.teamIds.splice(index, 1);
  }

  configurePoolParameters(size) {
    if (size <= 16) {
      this.optimalGroupSize = 4;
    } else if (size > 16 && size < 24) {
      this.optimalGroupSize = 5;
    } else {
      this.optimalGroupSize = 6;
    }
    this.sameSizePools = Math.floor(size / this.optimalGroupSize);
  }

  generateTeams(players: Player[], tournamentId: number): Team[] {
    const teams: Team[] = [];
    while (players.length > 0) {
      const teammate1 = players.splice(this.getRandomIntInclusive(0, players.length - 1), 1)[0].id;
      const teammate2 = players.splice(this.getRandomIntInclusive(0, players.length - 1), 1)[0].id;
      teams.push(new Team(tournamentId, teammate1, teammate2));
    }
    return teams;
  }

  // Creates rounds, pools, pool placements, and games for the created doubles tournament
  createDoublesData(insertId) {
    const teams: Team[] = this.generateTeams(Array.from(this.playersInTourny), insertId);
    console.log(teams);
    this._setupService.postTeams(teams).subscribe((response: any) => {
      console.log(response);
      for (let i = 0; i < response.length; i++) {
        teams[i].id = response[i].insertId;
      }
      this._setupService.createDoublesRound(this.numberOfRounds, teams.length, insertId).subscribe((response: any) => {
        this.configurePoolParameters(this.playersInTourny.size / 2);
        this._setupService.createDoublesPools(response.insertId, this.sameSizePools).subscribe((response) => {
          this._setupService.createDoublesPoolPlacements(response, teams, this.optimalGroupSize).subscribe((response) => {
            console.log(response);
          });
          // create pool placements, games here
        });
      });
    });
  }

  // Creates rounds, pools, pool placements, and games for the created singles tournament
  createSinglesData(insertId: number) {
    this._setupService.createSinglesRound(this.numberOfRounds, this.playersInTourny.size, insertId).subscribe((response: any) => {
      this.configurePoolParameters(this.playersInTourny.size);
      this._setupService.createSinglesPools(response.insertId, this.sameSizePools).subscribe((response) => {
        this._setupService.createSinglesPoolPlacements(response, Array.from(this.playersInTourny), this.optimalGroupSize).subscribe((response) => {
          console.log(response);
        });
        console.log(response);
        // create pool placements, games here
      });
    });
  }

  // Creates a tournament object, adds it to the database, and then calls the appropriate function to create all corresponding data
  createTourny() {
    if (this.tournyType === 'doubles') {
      this.tournament = new DoublesTournament(this.tournamentName, this.playersInTourny.size / 2, this.numberOfRounds);
      this._tournyService.addDoublesTournament(this.tournament).subscribe((result: any) => {
        this.createDoublesData(result.insertId);
      });
    } else {
      this.tournament  = new SinglesTournament(this.tournamentName, this.playersInTourny.size, this.numberOfRounds);
      this._tournyService.addSinglesTournament(this.tournament).subscribe((result: any) => {
        this.createSinglesData(result.insertId);
      });
    }
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Adds all remaining players to the working roster at once
  addAll(e) {
    e.preventDefault();
    this.playersToAdd.forEach( (player) => {
      this.playersInTourny.add(player);
      this.teamIds.push(player.id);
      this.playersToAdd.delete(player);
    });
  }

  changeRobinTypeSingle() {
    this.robinType = 'Single';
    this.singleRoundRobin = true;
    console.log(this.robinType);
  }

  changeRobinTypeDouble() {
    this.robinType = 'Double';
    this.singleRoundRobin = false;
    console.log(this.robinType);
  }

  changeRoundNumber() {
    if (this.numberOfRounds === 1) {
      this.numberOfRounds++;
    } else {
      this.numberOfRounds --;
    }
    this.oneRound = !this.oneRound;
  }

  // creates all games for one round robin round for every pool
  generateGames(pools) {
    let numberOfGames = 0;
    for (let i = 0; i < pools.length; i++) {
      numberOfGames = numberOfGames + (pools[i].length * (pools[i].length - 1) / 2);
    }
    for (let i = 0; i < numberOfGames; i++) {
      this.scheduleIndices.push(i);
    }
    for (let pool of pools) {
      let j = 0;
      let i = j + 1;
      while (j < pool.length - 1) {
        while (i < pool.length) {
          let rnd = this.getRandomIntInclusive(0, this.scheduleIndices.length - 1);
          let removedIndex = this.scheduleIndices.splice(rnd, 1)[0];
          let newGame = new Game(undefined, false, this.id, removedIndex, pool[j], pool[i], undefined, 0, undefined);
          this._gameService.addGame(newGame).subscribe();
          i++;
        }
        j++;
        i = j + 1;
      }
    }
  }
}
