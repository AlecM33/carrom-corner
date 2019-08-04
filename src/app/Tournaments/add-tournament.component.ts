import {Component, OnInit, DoCheck, ViewChild, ElementRef} from '@angular/core';
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

  @ViewChild('createBtn') createBtn: ElementRef;

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

  // Creates a tournament object, adds it to the database, and then calls the appropriate function to create all corresponding data
  createTourny() {
    this.createBtn.nativeElement.innerText = 'Creating...';
    if (this.tournyType === 'doubles') {
      this.tournament = new DoublesTournament(this.tournamentName, this.playersInTourny.size / 2, this.numberOfRounds, this.robinType);
      this._tournyService.addDoublesTournament(this.tournament).subscribe((result: any) => {
        this.tournament.id = result.insertId;
        this._setupService.createDoublesData(result.insertId, this.tournamentName, 1, this.playersInTourny, this.robinType);
        console.log('All Doubles Tournament data successfully created for the first round!');
      });
    } else {
      this.tournament = new SinglesTournament(this.tournamentName, this.playersInTourny.size, this.numberOfRounds, this.robinType);
      this._tournyService.addSinglesTournament(this.tournament).subscribe((result: any) => {
        this.tournament.id = result.insertId;
        this._setupService.createSinglesData(result.insertId, this.tournamentName, 1, this.playersInTourny, this.robinType).subscribe();
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
  }

  changeRobinTypeDouble() {
    this.robinType = 'Double';
    this.singleRoundRobin = false;
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
