import { Component, OnInit } from "@angular/core";
import { Tournament } from "./tournament";
import { PlayerService } from "../Players/player.service";
import { Player } from "../Players/player";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { TournamentService } from "./tournament.service";
import { Game } from "../Games/game";
import { Playoff } from "../Playoffs/playoff";
import { BracketGraph } from "../Brackets/bracketgraph";
import { BracketService } from "../Brackets/bracket.service";

@Component({
    selector: 'cr-tournyview',
    templateUrl: './view-tournament.component.html',
  })

export class ViewTournamentComponent implements OnInit {
    public poolLetter = 0;
    public tournySize = 0;
    public idPools = [];
    public playerPools = [];
    public players = [];
    public tournyName: string;
    public poolSize: number;
    public games = [];
    public gamesToDisplay = [];
    public id: number;
    public records = [];
    public playoffPool = [];
    public disabled = true;
    public numberOfPools = 0;
    public playoffsBegan = false;

    public bracket = [];

    public treeLevels = [];

    constructor (
                    private ps: PlayerService, 
                    private http: HttpClient, 
                    private active_route: ActivatedRoute, 
                    private router: Router, 
                    private ts: TournamentService, 
                    private bs: BracketService
                ) {
    }


    ngOnInit() {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.tournyName = this.active_route.snapshot.paramMap.get('name');
            this.http.get('http://localhost:3000/pools?tournyName=' + this.tournyName).subscribe((playerBase) => 
                { 
                    this.idPools = playerBase[0].pools;
                    this.filterPlayers();
                    this.ts.getTournament(this.tournyName).subscribe((tournament) => {
                        this.id = tournament[0].id;
                        this.tournySize = tournament[0].size;
                        this.ts.getGames(this.id).subscribe((games) => {
                            this.games = games;
                            this.gamesToDisplay = this.games;
                            this.games.sort((a, b) => {
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
                    });
            });
        });
    }

    // Filters schedule based on user-specified string
    filterGames(input) {
        let matchingPlayers = this.players.filter((value) => 
            {
                return value.name.toLowerCase().includes(input.toLowerCase())
            }
        );
        this.gamesToDisplay = this.games.filter((game) => 
            {
                let matchingIds = [];
                matchingPlayers.forEach((player) => matchingIds.push(player.id));
                return matchingIds.includes(game.id1) || matchingIds.includes(game.id2);
            }
        ); 
    }

    isDisabled() {
        for (let game of this.games) {
            if (game.winner == 0) {
                return true;
            }
        }
        return false;
    }

    findWins(id): number {
        let record = this.records.find((record) => record.playerId == id);
        if (record != undefined) {
            return record.wins;
        }
        return 0;
    }

    findDifferential(id): number {
        let record = this.records.find((record) => record.playerId == id);
        if (record != undefined) {
            return record.totalDifferential;
        }
        return 0;
    }

    findLosses(id): number {
        let record = this.records.find((record) => record.playerId == id);
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


    simulate() {
        for (let game of this.games) {
            let rnd = this.getRandomIntInclusive(1, 2);
            let attribute = 'id' + rnd;
            let winnerId = game[attribute];
            let rndDiff = this.getRandomIntInclusive(1, 8);
            this.ts.updateGame(game.id, winnerId, rndDiff).subscribe(() => {
            
            });
        }
    }

    // Goes through the list of games for the tournament and calculates player wins, losses, and differential
    calculateRecords() {
        for (let game of this.games) {
            if (game.winner != 0) {
                let winnerIndex = this.records.indexOf(this.records.find((record) => record.playerId == game.winner));
                this.records[winnerIndex].wins += 1;
                this.records[winnerIndex].totalDifferential += game.differential;
                let loser = 0;
                if (game.winner === game.id1) {
                    loser = game.id2
                } else {
                    loser = game.id1
                }
                let loserIndex = this.records.indexOf(this.records.find((record) => record.playerId == loser));
                this.records[loserIndex].losses ++;
                this.records[loserIndex].totalDifferential -= game.differential;
            }
        }
    }

    sortPools() {
        for (let pool of this.playerPools) {
            pool.sort((a, b) => 
                {
                    let aWins = this.findWins(a.id);
                    let bWins = this.findWins(b.id);
                    let aDiff = this.findDifferential(a.id);
                    let bDiff = this.findDifferential(b.id);
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
        for (let pool of this.playerPools) {
            this.numberOfPools ++;
            for (let player of pool) {
                this.records.push({"playerId": player.id, "wins": 0, "losses": 0, "totalDifferential": 0, "pool": this.playerPools.indexOf(pool), "parent": 0, "playoffSeed": 0})
            }
        }
        this.calculateRecords();
        this.sortPools();
    }

    viewGame(game) {
        this.router.navigateByUrl(this.tournyName + '/games/' + game['id'] + '/enter_result');
    }

    getLetter(index: number): string {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return alphabet[index];
    }

    convertToName(id) {
        return this.players.find((player) => player.id == id).name
    }

    filterPlayers() {
        let newPlayerPools = [];
        for (let pool of this.idPools) {
            pool = pool.map(id => this.players.find(function(player) 
                {
                    return id == player.id;
                }
            ));
            newPlayerPools.push(pool);
        }
        this.playerPools = newPlayerPools;
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

    addToPlayoffs(id) {
        if (this.playoffPool.find((player) => player.playerId == id) === undefined) {
            let record = this.records.find((record) => record.playerId == id);
            this.playoffPool.push(record);
        } else {
            let index = this.playoffPool.findIndex((el) => el.playerId == id);
            this.playoffPool.splice(index, 1);
        }
    }

    getPlayoffRoster() {
        this.playoffsBegan = true;
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
        for (let player of this.playoffPool) {
            player.playoffSeed = seed;
            seed ++;
        }

        let bracket = this.bs.generateBracket(this.playoffPool);
        let depth = this.bs.getTreeDepth(bracket.winnerNode)
        for (let i = depth; i > 0; i --) {
            let nodesAtLevel = [];
            this.bs.getNodesAtLevel(bracket.winnerNode, i, nodesAtLevel)
            this.treeLevels.push(nodesAtLevel);
        } 

        let pairedLevels = [];
        for (let level of this.treeLevels) {
            for (let i = 0; i < (level.length / 2); i++) {
                pairedLevels.push([level[2 * i], level[2 * i + 1]]);
            }
            
        }
        
       this.ts.addPlayoff(new Playoff(undefined, this.id, this.treeLevels)).subscribe(() =>
        {
            this.ts.toggleDefined(this.id).subscribe(() => {
                this.router.navigateByUrl('/playoffs/' + this.id);
            });
        });
       
        /*this.ts.addPlayoff(playoff).subscribe(() => {
            this.router.navigateByUrl('/playoffs/' + playoffName);
        });*/
    }
}
