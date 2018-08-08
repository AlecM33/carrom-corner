import { Component, OnInit } from "@angular/core";
import { Tournament } from "./tournament";
import { PlayerService } from "../Services/player.service";
import { Player } from "../Players/player";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { TournamentService } from "../Services/tournament.service";
import { Game } from "../Games/game";
import { Playoff } from "../Playoffs/playoff";
import { BracketGraph } from "../Brackets/bracketgraph";
import { BracketService } from "../Services/bracket.service";
import { GameService } from "../Services/game.service";
import { environment } from "environments/environment";

@Component({
    selector: 'cr-tournyview',
    templateUrl: './view-tournament.component.html',
  })

export class ViewTournamentComponent implements OnInit {

    public tournySize = 0;
    public idPools: Array<any>
    public players = [];
    public tournyName: string;
    public games = [];
    public unplayedGames = [];
    public playedGames = [];
    public id: number;
    public records = [];
    public playoffPool = [];
    public disabled = true;
    public selecting = false;
    public numberOfPools = 0;
    public playoffsBegan: boolean;

    public bracket = [];
    public tournyType = 'singles'
    public treeLevels = [];

    rosterInvalid = false;

    constructor (
                    private _playerService: PlayerService, 
                    private http: HttpClient, 
                    private active_route: ActivatedRoute, 
                    private router: Router, 
                    private _tournyService: TournamentService, 
                    private _bracketService: BracketService,
                    private _gameService: GameService
                ) {
    }


    ngOnInit() {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.tournyType = this.active_route.snapshot.paramMap.get('type');
            }
        });
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.tournyName = this.active_route.snapshot.paramMap.get('name');
            this.getTournyRoster();
        });
    }

    getTournyRoster() {
        this.http.get(environment.api_url + '/pools?tournyName=' + this.tournyName).subscribe((tournyRoster) => 
                { 
                    this.idPools = tournyRoster[0].pools;
                    this._tournyService.getTournament(this.tournyName).subscribe((tournament) => {
                        this.id = tournament[0].id;
                        this.playoffsBegan = tournament[0]['playoffDefined'];
                        this.tournySize = tournament[0].size;
                        this.getTournyGames();
                    });
            });
    }

    getTournyGames() {
        this._gameService.getGames(this.id).subscribe((games) => {
            this.games = games;
            this.unplayedGames = this.games.filter((game) => game.winner === undefined);
            this.playedGames = this.games.filter((game) => game.winner !== undefined);
            this.unplayedGames.sort((a, b) => {
                if (a.scheduleIndex >= b.scheduleIndex) {
                    return 1;
                }
                else {
                    return -1;
                }
            })
            this.disabled = this.isDisabled();
            this.generateStandings();
        });
    }

    // Filters schedule based on user-specified string
    filterGames(input, list) {
        let matchingPlayers = this.players.filter((value) => 
            {
                return value.name.toLowerCase().includes(input.toLowerCase())
            }
        );
        if (list === 'unplayed') {
            this.unplayedGames = this.games.filter((game) => 
                {
                    let matchingIds = [];
                    matchingPlayers.forEach((player) => matchingIds.push(player.id));
                    if (this.tournyType === 'doubles') {
                        return (matchingIds.includes(game.team1[0]) || matchingIds.includes(game.team1[1]) || matchingIds.includes(game.team2[0]) || matchingIds.includes(game.team2[1])) && !game.winner;
                    }
                    return ((matchingIds.includes(game.team1) || matchingIds.includes(game.team2))) && !game.winner;
                }
            ); 
        } else {
             this.playedGames = this.games.filter((game) => 
                {
                    let matchingIds = [];
                    matchingPlayers.forEach((player) => matchingIds.push(player.id));
                    if (this.tournyType === 'doubles') {
                        return (matchingIds.includes((game.team1[0]) || matchingIds.includes(game.team1[1]) || matchingIds.includes(game.team2[0]) || matchingIds.includes(game.team2[1]))) && game.winner;
                    }
                    return ((matchingIds.includes(game.team1) || matchingIds.includes(game.team2))) && game.winner;
                }
            ); 
        }
    }

    isDisabled() {
        for (let game of this.games) {
            if (!game.winner) {
                return true;
            }
        }
        return false;
    }

    findWins(id): number {
        let record = this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(id));
        if (record != undefined) {
            return record.wins;
        }
        return 0;
    }

    findDifferential(id): number {
        let record = this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(id));
        if (record != undefined) {
            return record.totalDifferential;
        }
        return 0;
    }

    findLosses(id): number {
        let record = this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(id));
        if (record != undefined) {
            return record.losses;
        }
        return 0;
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    // Function that simulates all tournament games for testing
    /*simulate() {
        for (let game of this.games) {
            let rnd = this.getRandomIntInclusive(1, 2);
            let attribute = 'team' + rnd;
            let winner = game[attribute];
            let rndDiff = this.getRandomIntInclusive(1, 8);
            this._gameService.updateGame(game.id, winner, rndDiff).subscribe(() => {
            
            });
        }
    }*/

    // Goes through the list of games for the tournament and calculates player wins, losses, and differential
    calculateRecords() {
        for (let game of this.playedGames) {
            if (game.winner) {
                let winnerIndex = this.records.indexOf(this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(game.winner)));
                this.records[winnerIndex].wins += 1;
                this.records[winnerIndex].totalDifferential += game.differential;
                let loser = 0;
                if (JSON.stringify(game.winner) === JSON.stringify(game.team1)) {
                    loser = game.team2;
                } else {
                    loser = game.team1;
                }
                let loserIndex = this.records.indexOf(this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(loser)));
                this.records[loserIndex].losses ++;
                this.records[loserIndex].totalDifferential -= game.differential;
            }
        }
    }

    sortPools() {
        for (let pool of this.idPools) {
            pool.sort((a, b) => 
                {
                    let aWins = this.findWins(a);
                    let bWins = this.findWins(b);
                    let aDiff = this.findDifferential(a);
                    let bDiff = this.findDifferential(b);
                    if (aWins > bWins) {
                        return -1;
                    } else if (aWins == bWins) {
                        if (aDiff >= bDiff) {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else {
                        return 1;
                    }
                }
            );
        }
    }

    generateStandings() {
        for (let pool of this.idPools) {
            this.numberOfPools ++;
            for (let team of pool) {
                this.records.push({"team": team, "wins": 0, "losses": 0, "totalDifferential": 0, "pool": this.idPools.indexOf(pool), "parent": 0, "playoffSeed": 0})
            }
        }
        this.calculateRecords();
        this.sortPools();
    }

    viewGame(game) {
        this.router.navigateByUrl(this.tournyName + '/' + this.tournyType + '/games/' + game['id'] + '/enter_result');
    }

    getLetter(index: number): string {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[index];
    }

    convertToName(team) {
        let teamString = JSON.stringify(team);
        if (team instanceof Array) {
            let firstName = this.players.find((player) => player.id === team[0]).name;
            let secondName = this.players.find((player) => player.id === team[1]).name;
            return firstName + ' & ' + secondName
        }
        return this.players.find((player) => player.id === team).name
    }

    powerOfTwo(x) {
        return ((Math.log(x)/Math.log(2)) % 1) === 0;
    }

    sortBySeed(round): any[] {
        round.sort((a, b) => {
            if (a['playoffSeed'] > b['playoffSeed']) {
                return 1;
            } else {
                return -1;
            }
        });
        return round;
    }

    addToPlayoffs(team) {
        if (this.playoffPool.find((record) => JSON.stringify(record.team) === JSON.stringify(team)) === undefined) {
            let record = this.records.find((record) => JSON.stringify(record.team) === JSON.stringify(team));
            this.playoffPool.push(record);
        } else {
            let index = this.playoffPool.findIndex((record) => JSON.stringify(record.team) === JSON.stringify(team));
            this.playoffPool.splice(index, 1);
        }
    }

    getPlayoffRoster() {
        this.playoffsBegan = true;
        this.selecting = true;
    }

    playoffValidation() {
        this.rosterInvalid = this.playoffPool.length < 2;
        if (!this.rosterInvalid) {
            this.startPlayoffs();
        }
    }

    // Builds a bracket using the bracket service and then splits them into rounds
    constructBracket() {
        let bracket = this._bracketService.generateBracket(this.playoffPool);
        let depth = this._bracketService.getTreeDepth(bracket.winnerNode)
        for (let i = depth; i > 0; i --) {
            let nodesAtLevel = [];
            this._bracketService.getNodesAtLevel(bracket.winnerNode, i, nodesAtLevel)
            this.treeLevels.push(nodesAtLevel);
        } 

        let playInSpots = [];
        for (let spot of this.treeLevels[1]) {
            if (JSON.stringify(spot) === '{}') {
                playInSpots.push(this.treeLevels[1].indexOf(spot));
            }
        }
        this._tournyService.addPlayoff(new Playoff(this.id, this.id, playInSpots, this.treeLevels, undefined, false)).subscribe(() =>
        {
            this._tournyService.toggleDefined(this.id).subscribe(() => {
                this.router.navigateByUrl('/playoffs/' + this.id);
            });
        });
    }


    startPlayoffs() {
        this.playoffPool.sort((a, b) => {
            if (a.wins > b.wins) {
                return -1;
            } 
            else if (a.wins == b.wins) {
                if (a.totalDifferential > b.totalDifferential) {
                    return -1;
                }
            }
            else {
                return 1;
            }
        });
        let seed = 1;
        for (let team of this.playoffPool) {
            team.playoffSeed = seed;
            seed ++;
        }
        this.constructBracket();
    }
}
