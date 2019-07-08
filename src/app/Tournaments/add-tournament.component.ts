import { Component, OnInit, DoCheck } from '@angular/core';
import { PlayerService } from '../Services/player.service';
import { HttpClient } from '@angular/common/http';
import { Player } from '../Players/player';
import { TournamentService } from '../Services/tournament.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { GameService } from '../Services/game.service';
import {DoublesTournament} from './doubles-tournament';
import {SinglesTournament} from './singles-tournament';
import {TournamentSetupService} from '../Services/tournament-setup.service';
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
  public tournamentName: string;
  public id = 0;
  public errorPresent = false;


  nameBlank = false;
  nameForbidden = false;
  rosterForbidden = false;
  rosterUneven = false;
  nameFormatInvalid = false;

  ngOnInit() {
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
      }
    });

    this._playerService.getPlayers().subscribe((players) => {
      this.players = players;
      this.maxSize = players.length;
      for (const player of this.players) {
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
      this.errorPresent = false;
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
    this._setupService.postTeams(teams).subscribe((response: any) => {
      for (let i = 0; i < response.length; i++) {
        teams[i].id = response[i].insertId;
      }
      this._setupService.createDoublesRound(this.numberOfRounds, teams.length, insertId).subscribe((resp: any) => {
        this.configurePoolParameters(this.playersInTourny.size / 2);
        this._setupService.createDoublesPools(resp.insertId, this.sameSizePools).subscribe((resp: any) => {
          this._setupService.createDoublesPoolPlacements(resp, teams, this.optimalGroupSize).subscribe((resp: any) => {
            this._setupService.createDoublesGames(this.tournament.id);
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
        this._setupService.createSinglesPoolPlacements(response, Array.from(this.playersInTourny), this.optimalGroupSize).subscribe(() => {
          this._setupService.createSinglesGames(this.tournament.id);
        });
      });
    });
  }

  // Creates a tournament object, adds it to the database, and then calls the appropriate function to create all corresponding data
  createTourny() {
    if (this.tournyType === 'doubles') {
      this.tournament = new DoublesTournament(this.tournamentName, this.playersInTourny.size / 2, this.numberOfRounds);
      this._tournyService.addDoublesTournament(this.tournament).subscribe((result: any) => {
        this.tournament.id = result.insertId;
        this.createDoublesData(result.insertId);
        console.log('All Doubles Tournament data successfully created for the first round!');
      });
    } else {
      this.tournament = new SinglesTournament(this.tournamentName, this.playersInTourny.size, this.numberOfRounds);
      this._tournyService.addSinglesTournament(this.tournament).subscribe((result: any) => {
        this.tournament.id = result.insertId;
        this.createSinglesData(result.insertId);
        console.log('All Singles Tournament data successfully created for the first round!');
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
    this.playersToAdd.forEach((player) => {
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
      this.numberOfRounds--;
    }
    this.oneRound = !this.oneRound;
  }
}
