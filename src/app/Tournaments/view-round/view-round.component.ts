import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {PlayerService} from '../../Services/player.service';
import {HttpClient} from '@angular/common/http';
import {TournamentService} from '../../Services/tournament.service';
import {BracketService} from '../../Services/bracket.service';
import {GameService} from '../../Services/game.service';
import {TournamentSetupService} from '../../Services/tournament-setup.service';
import {Player} from '../../Players/player';
import {PlayerRecord} from '../../Records/player-record';
import {SinglesGame} from '../../Games/singles-game';
import {DoublesGame} from '../../Games/doubles-game';
import {Team} from '../../Teams/team';
import {TeamService} from '../../Services/team.service';
import {Playoff} from '../../Playoffs/playoff';
import {PlayoffService} from '../../Services/playoff.service';
import {SinglesBracketNode} from '../../Brackets/singles-bracket-node';
import {DoublesBracketNode} from '../../Brackets/doubles-bracket-node';

@Component({
  selector: 'app-view-round',
  templateUrl: './view-round.component.html',
  styleUrls: ['./view-round.component.css']
})
export class ViewRoundComponent implements OnInit {

  public tournyType: string;
  public players: Player[];
  public teams: Team[];
  public tournamentId: number;
  public currentRound: number;
  public numberOfRounds: number;
  public tournamentName: string;
  public playerPools = [];
  public recordPools = [];
  public roundId: number;
  public allGamesPlayed = false;
  public selectingAdvancements = false;
  public numberToAdvance = 1;
  public extraPlayer = false;
  public gamePools = [];
  public tournamentSize: number;
  public tournament = undefined;
  public simulated = false;
  public loading = true;

  @ViewChild('roundModal') roundModal: ElementRef;

  constructor(public _playerService: PlayerService,
              public http: HttpClient,
              public active_route: ActivatedRoute,
              public router: Router,
              public _setupService: TournamentSetupService,
              public _tournamentService: TournamentService,
              public _gameService: GameService,
              public _teamService: TeamService,
              public _bracketService: BracketService,
              public _playoffService: PlayoffService
              ) { }

  ngOnInit() {
    this.recordPools = [];
    this.loading = true;
    this.allGamesPlayed = false;
    this.tournyType = this.active_route.snapshot.paramMap.get('type');
    this.tournamentName = this.active_route.snapshot.paramMap.get('name');
    this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
    this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
    this.prepareRound();
  }

  prepareRound() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.tournyType = this.active_route.snapshot.paramMap.get('type');
        this.tournamentName = this.active_route.snapshot.paramMap.get('name');
        this.tournamentId = parseInt(this.active_route.snapshot.paramMap.get('tourny_id'), 10);
        this.currentRound = parseInt(this.active_route.snapshot.paramMap.get('round'), 10);
      }
    });
    this.getRoundData();
  }

  getRoundData() {
    this._tournamentService.getTournament(this.tournamentId, this.tournyType).subscribe((tournament) => {
      this.tournament = tournament;
      this.numberOfRounds = tournament[0]['rounds'];
      this.tournamentSize = tournament[0]['size'];
      this._playerService.getPlayers().subscribe((players) => {
        this.players = players;
        if (this.tournyType === 'singles') {
          this.players = players;
          this.retrieveSinglesData();
        } else {
          this._teamService.getTeams(this.tournamentId).subscribe((teams) => {
            this.teams = teams;
            this.retrieveDoublesData();
          });
        }
      });
    });
  }

  retrieveSinglesData() {
    this._setupService.getSinglesRound(this.tournamentId, this.tournament[0]['current_round']).subscribe((round) => {
      this.roundId = round[0]['id'];
      this._setupService.getSinglesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getSinglesPoolPlacements(pool['id']).subscribe((placements: any) => {
            const playerRecords: PlayerRecord[] = [];
            for (const placement of placements) {
              playerRecords.push(new PlayerRecord(poolId, placement['player_id'], null));
            }
            this.recordPools.push(playerRecords);
          });
          this._gameService.getSinglesGamesInPool(poolId, this.tournamentId, this.roundId).subscribe((games) => {
            console.log(games);
            this.allGamesPlayed = !games.find((game) => !game.winner);
            this.gamePools.push(games);
            this.calculatePlayerRecords(games);
            this.sortPools();
          });
        }
      });
    });
  }

  sortPools() {
    for (const pool of this.recordPools) {
      pool.sort((a, b) => {
          if(a.wins > b.wins) return -1;
          if(b.wins > a.wins) return 1;
          if(a.losses < b.losses) return -1;
          if(b.losses > a.losses) return 1;
          return a.totalDiff >= b.totalDiff ? -1 : 1;
        }
      );
    }
    this.loading = false;
  }

  sortPlayoffPool(pool) {
    pool.sort((a, b) => {
        if(a.wins > b.wins) return -1;
        if(b.wins > a.wins) return 1;
        if(a.losses < b.losses) return -1;
        if(b.losses > a.losses) return 1;
        return a.totalDiff >= b.totalDiff ? -1 : 1;
      }
    );
    return pool;
  }

  retrieveDoublesData() {
    this._setupService.getDoublesRound(this.tournamentId, this.tournament[0]['current_round']).subscribe((round) => {
      this.roundId = round[0]['id'];
      this._setupService.getDoublesPools(this.roundId).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this._setupService.getDoublesPoolPlacements(pool['id']).subscribe((placements: any) => {
            const playerRecords: PlayerRecord[] = [];
            for (const placement of placements) {
              playerRecords.push(new PlayerRecord(poolId, null, placement['team_id']));
            }
            this.recordPools.push(playerRecords);
          });
          this._gameService.getDoublesGamesInPool(poolId, this.tournamentId, this.roundId).subscribe((games) => {
            this.allGamesPlayed = !games.find((game) => !game.winner);
            this.gamePools.push(games);
            this.calculateTeamRecords(games);
            this.sortPools();
          });
        }
      });
    });
  }

  calculatePlayerRecords(games: SinglesGame[]) {
    for (const game of games) {
      if (game.winner) {
        const playerPool = this.recordPools.find((pool) => pool.find((record) => record.playerId === game.winner));
        const winningPlayerIndex = playerPool.findIndex((record) => record.playerId === game.winner);
        const losingPlayerIndex = playerPool.findIndex((record) => record.playerId === game.loser);

        playerPool[winningPlayerIndex].wins++;
        playerPool[winningPlayerIndex].totalDiff += game.differential;
        playerPool[losingPlayerIndex].losses++;
        playerPool[losingPlayerIndex].totalDiff -= game.differential;
      }
    }
  }

  calculateTeamRecords(games: DoublesGame[]) {
    for (const game of games) {
      if (game.winner) {
        const teamPool = this.recordPools.find((pool) => pool.find((record) => record.teamId === game.winner));
        const winningTeamIndex = teamPool.findIndex((record) => record.teamId === game.winner);
        const losingTeamIndex = teamPool.findIndex((record) => record.teamId === game.loser);

        teamPool[winningTeamIndex].wins++;
        teamPool[winningTeamIndex].totalDiff += game.differential;
        teamPool[losingTeamIndex].losses++;
        teamPool[losingTeamIndex].totalDiff -= game.differential;
      }
    }
  }

  setRoundAdvancements(plusOrMinus: string) {
    if (plusOrMinus === 'plus') {
      if (this.numberToAdvance < this.findLargestPool()) {
        this.numberToAdvance += 1;
      }
    } else {
      if (this.numberToAdvance > 1) {
        this.numberToAdvance -= 1;
      }
    }
    console.log(this.numberToAdvance);
  }

  changeExtraPlayerChoice() {
    this.extraPlayer = !this.extraPlayer;
    console.log(this.extraPlayer);
  }

  findLargestPool() {
    let largest = 0;
    for (const pool of this.recordPools) {
      if (pool.length > largest) {
        largest = pool.length;
      }
    }
    return largest;
  }

  hideModal() {
    this.roundModal.nativeElement.className = 'modal hidden';
  }

  getLetter(index: number): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return alphabet[index];
  }

  convertToName(id) {
    if (this.tournyType === 'singles') {
      return this.players.find((player) => player.id === id).name;
    } else {
      const foundTeam = this.teams.find((team) => team.id === id);
      return this.players.find((player) => player.id === foundTeam.player1Id).name
        + ', ' + this.players.find((player) => player.id === foundTeam.player2Id).name;
      // TODO: fetch teams in doubles tournament and map to names;
    }
  }

  routeToPool(poolId: number, letter: string) {
    this.router.navigateByUrl('/tournaments/' + this.tournyType + '/' + this.tournamentName + '/' + this.tournamentId + '/' +
      this.currentRound + '/' + this.roundId + '/' + poolId + '/' + letter);
  }

  openModal() {
    this.roundModal.nativeElement.className = 'modal';
  }

  startNextRound(playoffs: boolean) {
    this.roundModal.nativeElement.className = 'modal hidden';
    let roundUpdateObs;
    this.tournyType === 'singles' ?
      roundUpdateObs = this._tournamentService.updateSinglesTournamentRound(this.tournament[0].id, 2)
      : roundUpdateObs = this._tournamentService.updateDoublesTournamentRound(this.tournament[0].id, 2);
    roundUpdateObs.subscribe((resp) => {
      const nextRoundAdvancers = new Set();
      for (const pool of this.recordPools) {
        for (let i = 0; i < this.numberToAdvance; i++) {
          this.tournyType === 'singles' ?
            nextRoundAdvancers.add(this.players.find((player) => player.id === pool[i].playerId))
            : nextRoundAdvancers.add(this.teams.find((team) => team.id === pool[i].teamId));
        }
        if (pool.length === this.findLargestPool() && this.extraPlayer === true && this.numberToAdvance !== this.findLargestPool()) {
          this.tournyType === 'singles' ?
            nextRoundAdvancers.add(this.players.find((player) => player.id === pool[this.numberToAdvance].playerId))
            : nextRoundAdvancers.add(this.teams.find((team) => team.id === pool[this.numberToAdvance].teamId));
        }
      }
      if (playoffs) {
        this.startPlayoffs(nextRoundAdvancers);
      } else {
        this.recordPools = [];
        this.loading = true;
        this.allGamesPlayed = false;
        this.tournyType === 'singles' ?
          this._setupService.createSinglesData(this.tournamentId, this.tournamentName, 2, nextRoundAdvancers).subscribe((nav) => {
            this.prepareRound();
          })
          : this._setupService.createDoublesDataForSecondRound(this.tournamentId, this.tournamentName, 2, nextRoundAdvancers).subscribe((nav) => {
            this.prepareRound();
          });
      }
    });
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Function that simulates all tournament games for testing
  simulate() {
    this.simulated = true;
    for (const pool of this.gamePools) {
      for (let i = 0; i < pool.length; i++) {
        let winner;
        if (this.tournyType === 'singles') {
          this.getRandomIntInclusive(1, 2) === 1 ? winner = pool[i].player1Id : winner = pool[i].player2Id;
          this.getRandomIntInclusive(1, 2) === 1 ? pool[i].validator = pool[i].player1Id : pool[i].validator = pool[i].player2Id;
          this.getRandomIntInclusive(1, 2) === 1 ? pool[i].coinFlipWinner = pool[i].player1Id : pool[i].coinFlipWinner = pool[i].player2Id;
          if (winner === pool[i].player1Id) {
            pool[i].winner = pool[i].player1Id;
            pool[i].loser = pool[i].player2Id;
          } else {
            pool[i].winner = pool[i].player2Id;
            pool[i].loser = pool[i].player1Id;
          }
        } else {
          this.getRandomIntInclusive(1, 2) === 1 ? winner = pool[i].team1Id : winner = pool[i].team2Id;
          this.getRandomIntInclusive(1, 2) === 1 ? pool[i].validator = pool[i].team1Id : pool[i].validator = pool[i].team2Id;
          this.getRandomIntInclusive(1, 2) === 1 ? pool[i].coinFlipWinner = pool[i].team1Id : pool[i].coinFlipWinner = pool[i].team2Id;
          if (winner === pool[i].team1Id) {
            pool[i].winner = pool[i].team1Id;
            pool[i].loser = pool[i].team2Id;
          } else {
            pool[i].winner = pool[i].team2Id;
            pool[i].loser = pool[i].team1Id;
          }
        }
        pool[i].differential = this.getRandomIntInclusive(1, 11);
        this.tournyType === 'singles' ? this._gameService.updateSinglesGame(pool[i]).subscribe()
          : this._gameService.updateDoublesGame(pool[i]).subscribe();
      }
      this.tournyType === 'singles' ? this.calculatePlayerRecords(pool) : this.calculateTeamRecords(pool);
      this.allGamesPlayed = !pool.find((game) => !game.winner);
      this.sortPools();
    }
  }

  startPlayoffs(advancers: Set<PlayerRecord>) {
    const playoffArray = this.sortPlayoffPool(Array.from(advancers));
    let seed = 1;
    for (const advancer of playoffArray) {
      advancer.playoffSeed = seed;
      seed ++;
    }
    this.constructBracket(playoffArray);
  }

  // Builds a bracket using the bracket service and then splits them into rounds
  constructBracket(playoffArray: PlayerRecord[]) {
    const treeLevels = [];
    const bracket = this._bracketService.generateBracket(playoffArray);
    const depth = this._bracketService.getTreeDepth(bracket.winnerNode);
    for (let i = 1; i <= depth; i ++) {
      const nodesAtLevel = [];
      this._bracketService.getNodesAtLevel(bracket.winnerNode, i, nodesAtLevel);
      treeLevels.push(nodesAtLevel);
    }
    console.log(treeLevels);
    this.createPlayoffs(treeLevels, playoffArray.length);
  }

  createPlayoffs(treeLevels: Array<Array<any>>, size: number) {
    if (this.tournyType === 'singles') {
      this._playoffService.addSinglesPlayoff(this.tournamentId).subscribe((playoff: any) => {
        this.postBracketInfo(playoff.insertId, treeLevels);
        this._tournamentService.updateSinglesPlayoff(this.tournamentId).subscribe(() => {
          this.router.navigateByUrl('/playoffs/' + this.tournyType + '/' + this.tournamentId);
        });
      });
    } else {
      this._playoffService.addDoublesPlayoff(this.tournamentId).subscribe((playoff: any) => {
        this.postBracketInfo(playoff.insertId, treeLevels);
        this._tournamentService.updateDoublesPlayoff(this.tournamentId).subscribe(() => {
          this.router.navigateByUrl('/playoffs/' + this.tournyType + '/'  + this.tournamentId);
        });
      });
    }
  }

  // Converts the bracket tree into a balanced binary tree representation, where nodeIndex is the node number N starting from 1 at the root
  createSinglesBracketNodesAndGames(bracketId: number, playoffId: number, treeLevels) {
    console.log(playoffId);
    let nodeIndex = 1;
    let playInAmount = 0;
    let currentPlayIn = 0;
    const balancedLeafIndices = [];
    for (let i = 0; i < treeLevels.length; i++) {
      for (let j = 0; j < treeLevels[i].length; j += 2) {
        let newNode;
        // leaf node that is a play-in match
        if (treeLevels[i][j] instanceof Player && treeLevels[i][j + 1] instanceof Player && i === treeLevels.length - 1) {
          newNode = new SinglesBracketNode(bracketId, treeLevels[i][j].id, treeLevels[i][j + 1].id, treeLevels[i][j].playoffSeed,
            treeLevels[i][j + 1].playoffSeed, balancedLeafIndices[currentPlayIn]);
          currentPlayIn++;
          // leaf node that is not a play-in match
        } else if (treeLevels[i][j] instanceof Player && treeLevels[i][j + 1] instanceof Player && i !== treeLevels.length - 1) {
          newNode = new SinglesBracketNode(bracketId, treeLevels[i][j].id, treeLevels[i][j + 1].id, treeLevels[i][j].playoffSeed,
            treeLevels[i][j + 1].playoffSeed, nodeIndex);
          // node that contains one play-in spot
        } else if (treeLevels[i][j] instanceof Player && !(treeLevels[i][j + 1] instanceof Player)) {
          newNode = new SinglesBracketNode(bracketId, treeLevels[i][j].id, null, treeLevels[i][j].playoffSeed, null, nodeIndex);
          balancedLeafIndices[playInAmount] = (nodeIndex * 2) + 1;
          playInAmount++;
          // node that contains two play-in spots
        } else if (!(treeLevels[i][j] instanceof Player) && !(treeLevels[i][j + 1] instanceof Player) && i === treeLevels.length - 2) {
          newNode = new SinglesBracketNode(bracketId, null, null, null, null, nodeIndex);
          balancedLeafIndices[playInAmount] = (nodeIndex * 2);
          balancedLeafIndices[playInAmount + 1] = (nodeIndex * 2) + 1;
          playInAmount += 2;
          // blank nodes deeper in the tree
        } else {
          newNode = new SinglesBracketNode(bracketId, null, null, null, null, nodeIndex);
        }
        this._bracketService.addSinglesBracketNode(newNode).subscribe();
        this._gameService.addSinglesGame(new SinglesGame(this.tournamentId, null, null, true, playoffId, null, null)).subscribe();
        nodeIndex ++;
      }
    }
  }

  createDoublesBracketNodesAndGames(bracketId: number, playoffId: number, treeLevels) {
    let nodeIndex = 1;
    let playInAmount = 0;
    let currentPlayIn = 0;
    const balancedLeafIndices = [];
    for (let i = 0; i < treeLevels.length; i++) {
      for (let j = 0; j < treeLevels[i].length; j += 2) {
        let newNode;
        if (treeLevels[i][j] instanceof Team && treeLevels[i][j + 1] instanceof Team && i === treeLevels.length - 1) {
          newNode = new DoublesBracketNode(bracketId, treeLevels[i][j].id, treeLevels[i][j + 1].id, treeLevels[i][j].playoffSeed,
            treeLevels[i][j + 1].playoffSeed, balancedLeafIndices[currentPlayIn]);
          currentPlayIn++;
        } else if (treeLevels[i][j] instanceof Team && treeLevels[i][j + 1] instanceof Team && i !== treeLevels.length - 1) {
          newNode = new DoublesBracketNode(bracketId, treeLevels[i][j].id, treeLevels[i][j + 1].id, treeLevels[i][j].playoffSeed,
            treeLevels[i][j + 1].playoffSeed, nodeIndex);
        } else if (treeLevels[i][j] instanceof Team && !(treeLevels[i][j + 1] instanceof Team)) {
          newNode = new DoublesBracketNode(bracketId, treeLevels[i][j].id, null, treeLevels[i][j].playoffSeed, null, nodeIndex);
          balancedLeafIndices[playInAmount] = (nodeIndex * 2) + 1;
          playInAmount++;
        } else if (!(treeLevels[i][j] instanceof Team) && !(treeLevels[i][j + 1] instanceof Team) && i === treeLevels.length - 2) {
          newNode = new SinglesBracketNode(bracketId, null, null, null, null, nodeIndex);
          balancedLeafIndices[playInAmount] = (nodeIndex * 2);
          balancedLeafIndices[playInAmount + 1] = (nodeIndex * 2) + 1;
          playInAmount += 2;
        } else {
          newNode = new DoublesBracketNode(bracketId, null, null, null, null, nodeIndex);
        }
        this._bracketService.addDoublesBracketNode(newNode).subscribe();
        this._gameService.addDoublesGame(new DoublesGame(this.tournamentId, null, null, true, playoffId, null, null)).subscribe();
        nodeIndex ++;
      }
    }
  }

  postBracketInfo(playoffInsertId: number, treeLevels: Array<Array<any>>) {
    if (this.tournyType === 'singles') {
      this._bracketService.addSinglesBracket(playoffInsertId, treeLevels.length).subscribe((bracket: any) => {
        this.createSinglesBracketNodesAndGames(bracket.insertId, playoffInsertId, treeLevels);
      });
    } else {
      this._bracketService.addDoublesBracket(playoffInsertId, treeLevels.length).subscribe((bracket: any) => {
        this.createDoublesBracketNodesAndGames(bracket.insertId, playoffInsertId, treeLevels);
      });
    }
  }
}
