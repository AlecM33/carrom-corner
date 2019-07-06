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
import { Pool } from '../Pools/pool';
import { Game } from '../Games/game';
import { GameService } from '../Services/game.service';
import { reduceEachTrailingCommentRange } from 'typescript';
import {DoublesTournament} from './doubles-tournament';
import {SinglesTournament} from './singles-tournament';
import {TournamentSetupService} from '../Services/tournament-setup.service';


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
    if (!this.tournamentName) {
      this.nameBlank = true;
    } else {
      this.nameBlank = false;
    }
    if (this.tournamentName && !(/^[a-zA-Z0-9 ]*$/).test(this.tournamentName)) {
      this.nameFormatInvalid = true;
    } else {
      this.nameFormatInvalid = false;
    }
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

  createDoublesData(insertId) {
    this._setupService.createDoublesRounds(this.numberOfRounds, this.playersInTourny.size / 2, insertId);
  }

  createSinglesData(insertId: number) {
    this._setupService.createSinglesRounds(this.numberOfRounds, this.playersInTourny.size, insertId);
    //this.createSinglesPools();
    //this.createSinglesGames();
  }

  // Creates a tournament object and calls the tournament service to add to the database
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
    this.robinType = "Single";
    this.singleRoundRobin = true;
    console.log(this.robinType);
  }

  changeRobinTypeDouble() {
    this.robinType = "Double";
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

  // After generating balanced pools, rations remaining players among created pools
  distributeLeftovers(sameSizePools, leftovers, teams) {
    let i = 0;
    let j = 0;
    while (i < leftovers) {
      //leftovers are greater than the number of pools available
      if (j == sameSizePools) {
        j = 0;
      }
      let rnd = this.getRandomIntInclusive(0, this.teamIds.length - 1);
      let removedPlayer = teams.splice(rnd, 1)[0];
      this.generatedPools[j].push(removedPlayer);

      i ++;
      j ++;
    }
  }

  addPool(pool) {
    let newPool = new Pool(this.id, pool, this.tournamentName);
    this._tournyService.addPool(newPool).subscribe(() => {
      this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournamentName);
    });
  }

  // Takes the selected roster and generates an appropriate player pool distribution
  generatePools(teams) {
    let optimalGroupSize = 0;
    if(this.tournament.size <= 16) {
      optimalGroupSize = 4;
    } else if (this.tournament.size > 16 && this.tournament.size < 24) {
      optimalGroupSize = 5;
    } else {
      optimalGroupSize = 6;
    }

    let sameSizePools = Math.floor(teams.length / optimalGroupSize);
    let leftovers = teams.length % optimalGroupSize;

    for (let i=0; i < sameSizePools; i++) {
      let newPool = [];
      for (let j = 0; j < optimalGroupSize; j++) {
        let rnd = this.getRandomIntInclusive(0, teams.length - 1);
        let removedPlayer = teams.splice(rnd, 1)[0];
        newPool.push(removedPlayer);
      }
      this.generatedPools.push(newPool);
    }
    this.distributeLeftovers(sameSizePools, leftovers, teams);
    this.addPool(this.generatedPools);
  }

  // Generates a round robin set of games and schedules them randomly
  generateSchedule (pools) {
    this.generateGames(pools);
    if (this.robinType === 'Double') {
      this.generateGames(pools);
    }
  }

  generateTeams() {
    while (this.teamIds.length > 0) {
      let teammate1 = this.teamIds.splice(this.getRandomIntInclusive(0, this.teamIds.length - 1), 1)[0];
      let teammate2 = this.teamIds.splice(this.getRandomIntInclusive(0, this.teamIds.length - 1), 1)[0];
      let newTeam = [teammate1, teammate2];
      this.doublesTeamIds.push(newTeam);
    }
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
