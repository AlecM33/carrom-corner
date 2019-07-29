import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {SinglesRound} from '../Rounds/singles-round';
import {Observable} from 'rxjs/Observable';
import {concatMap, tap} from 'rxjs/operators';
import {DoublesRound} from '../Rounds/doubles-round';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {SinglesPool} from '../Pools/singles-pool';
import {DoublesPool} from '../Pools/doubles-pool';
import {Player} from '../Players/player';
import {SinglesPoolPlacement} from '../Pools/singles-pool-placement';
import {DoublesPoolPlacement} from '../Pools/doubles-pool-placement';
import {Team} from '../Teams/team';
import {SinglesGame} from '../Games/singles-game';
import {GameService} from './game.service';
import {DoublesGame} from '../Games/doubles-game';
import {Router} from '@angular/router';

@Injectable()
export class TournamentSetupService {

  private optimalGroupSize: number;
  private sameSizePools: number;

  constructor(private http: HttpClient, private _gameService: GameService, private router: Router) {}

  // Creates rounds, pools, pool placements, and games for the created singles tournament
  createSinglesData(insertId: number, tournyName: string, roundNumber: number, players: Set<Player>): Observable<any> {
    return this.createSinglesRound(roundNumber, players.size, insertId).pipe(concatMap((response: any) => {
      const roundId = response.insertId;
      this.configurePoolParameters(players.size);
      return this.createSinglesPools(roundId, this.sameSizePools).pipe(concatMap((res) => {
        return this.createSinglesPoolPlacements(res, Array.from(players), this.optimalGroupSize).pipe(tap(() => {
          this.createSinglesGames(insertId, roundNumber);
          this.router.navigateByUrl('/tournaments/singles/' + tournyName + '/' + insertId + '/' + roundNumber);
          console.log('All Singles Tournament data successfully created for the first round!');
        }));
      }));
    }));
  }

  // Creates rounds, pools, pool placements, and games for the created doubles tournament
  createDoublesData(insertId: number, tournyName: string, roundNumber: number, members: Set<any>) {
    if (Array.from(members)[0] instanceof Team) {
      this.createDoublesDataForSecondRound(insertId, tournyName, roundNumber, members);
    } else {
      const teams: Team[] = this.generateTeams(Array.from(members), insertId);
      this.postTeams(teams).subscribe((response: any) => {
        for (let i = 0; i < response.length; i++) {
          teams[i].id = response[i].insertId;
        }
        this.createDoublesRound(roundNumber, teams.length, insertId).subscribe((resp: any) => {
          const roundId = resp.insertId;
          this.configurePoolParameters(teams.length);
          this.createDoublesPools(roundId, this.sameSizePools).subscribe((resp: any) => {
            this.createDoublesPoolPlacements(resp, teams, this.optimalGroupSize).subscribe((resp: any) => {
              this.createDoublesGames(insertId, roundNumber);
              this.router.navigateByUrl('/tournaments/doubles/' + tournyName + '/' + insertId + '/' + roundNumber);
            });
          });
        });
      });
    }
  }

  createDoublesDataForSecondRound(insertId: number, tournyName: string, roundNumber: number, members: Set<Team>) {
    this.createDoublesRound(roundNumber, members.size, insertId).subscribe((resp: any) => {
      const roundId = resp.insertId;
      this.configurePoolParameters(members.size);
      this.createDoublesPools(roundId, this.sameSizePools).subscribe((resp: any) => {
        this.createDoublesPoolPlacements(resp, Array.from(members), this.optimalGroupSize).subscribe((resp: any) => {
          this.createDoublesGames(insertId, roundNumber);
          this.router.navigateByUrl('/tournaments/doubles/' + tournyName + '/' + insertId + '/' + roundNumber);
        });
      });
    });
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

  configurePoolParameters(size) {
    if (size <= 6) {
      this.optimalGroupSize = size;
    } else if (size > 6 && size <= 16) {
      this.optimalGroupSize = 4;
    } else if (size > 16 && size < 24) {
      this.optimalGroupSize = 5;
    } else {
      this.optimalGroupSize = 6;
    }
    this.sameSizePools = Math.floor(size / this.optimalGroupSize);
  }

  createSinglesRound(roundNumber, size, tournamentId): Observable<Object> {
    const round = new SinglesRound(tournamentId, size, roundNumber);
    return this.addSinglesRound(round);
  }

  addSinglesRound(round: SinglesRound): Observable<Object> {
    const payload = { 'tournamentId': round.tournamentId,
                      'size': round.size,
                      'number': round.number
                    };
    return this.http.request('post', '/api/rounds/singles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createDoublesRound(roundNumber, size, tournamentId): Observable<Object> {
    const round = new DoublesRound(tournamentId, size, roundNumber);
    return this.addDoublesRound(round);
  }

  addDoublesRound(round: DoublesRound): Observable<Object> {
    const payload = { 'tournamentId': round.tournamentId,
      'size': round.size,
      'number': round.number
    };
    return this.http.request('post', '/api/rounds/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  postTeams(teams) {
    const observablesArray: Observable<Object>[] = [];
    for (const team of teams) {
      observablesArray.push(this.addTeam(team));
    }
    return forkJoin(...observablesArray);
  }

  createSinglesPools(roundId: number, sameSizePools: number): Observable<Object[]> {
    const observablesArray: Observable<Object>[] = [];
    for (let i = 0; i < sameSizePools; i++) {
      const newPool = new SinglesPool(roundId, i + 1);
      observablesArray.push(this.addSinglesPool(newPool));
    }
    return forkJoin(...observablesArray);
  }

  addSinglesPool(pool: SinglesPool): Observable<Object> {
    const payload = {
      'roundId': pool.roundId,
      'number': pool.number
    };
    return this.http.request('post', '/api/pools/singles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createDoublesPools(roundId: number, sameSizePools: number) {
    const observablesArray: Observable<Object>[] = [];
    for (let i = 0; i < sameSizePools; i++) {
      const newPool = new DoublesPool(roundId, i + 1);
      observablesArray.push(this.addDoublesPool(newPool));
    }
    return forkJoin(...observablesArray);
  }

  addDoublesPool(pool: DoublesPool): Observable<Object> {
    const payload = {
      'roundId': pool.roundId,
      'number': pool.number
    };
    return this.http.request('post', '/api/pools/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Gets a random integer in the specified range (inclusive)
  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // After generating balanced pools, rations remaining players among created pools
  distributeSinglesLeftovers(poolDistribution: SinglesPoolPlacement[], players: Player[], leftovers: number, response: any[]): SinglesPoolPlacement[] {
    let i = 0;
    let j = 0;
    while (i < leftovers) {
      // leftovers are greater than the number of pools available
      if (j === response.length) {
        j = 0;
      }
      const rnd = this.getRandomIntInclusive(0, players.length - 1);
      const removedPlayer = players.splice(rnd, 1)[0];
      const newPlacement = new SinglesPoolPlacement(response[j].insertId, removedPlayer.id);
      poolDistribution.push(newPlacement);
      i ++;
      j ++;
    }
    return poolDistribution;
  }

  // After generating balanced pools, rations remaining players among created pools
  distributeDoublesLeftovers(poolDistribution: DoublesPoolPlacement[], teams: Team[], leftovers: number, response: any[]): DoublesPoolPlacement[] {
    let i = 0;
    let j = 0;
    while (i < leftovers) {
      // leftovers are greater than the number of pools available
      if (j === response.length) {
        j = 0;
      }
      const rnd = this.getRandomIntInclusive(0, teams.length - 1);
      const removedTeam = teams.splice(rnd, 1)[0];
      const newPlacement = new DoublesPoolPlacement(response[j].insertId, removedTeam.id);
      poolDistribution.push(newPlacement);
      i ++;
      j ++;
    }
    return poolDistribution;
  }

  createSinglesPoolPlacements(response: any[], players: Player[], groupSize: number): Observable<Object> {
    let poolDistribution: SinglesPoolPlacement[] = [];
    const leftovers = players.length % groupSize;
    for (const insertedPool of response) {
      for (let i = 0; i < groupSize; i++) {
        const rnd = this.getRandomIntInclusive(0, players.length - 1);
        const removedPlayer = players.splice(rnd, 1)[0];
        const newPlacement = new SinglesPoolPlacement(insertedPool.insertId, removedPlayer.id);
        poolDistribution.push(newPlacement);
      }
    }
    if (leftovers > 0) {
      poolDistribution = this.distributeSinglesLeftovers(poolDistribution, players, leftovers, response);
    }
    return this.addSinglesPoolPlacements(poolDistribution);
  }

  addSinglesPoolPlacements(poolPlacements: SinglesPoolPlacement[]): Observable<Object> {
    const nestedPayload = {};
    for (let i = 0; i < poolPlacements.length; i++) {
      nestedPayload[i] = {
        'poolId': poolPlacements[i].poolId,
        'playerId': poolPlacements[i].playerId
      };
    }
    return this.http.request('post', '/api/pool_placements/singles/post', {
      body: nestedPayload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  createDoublesPoolPlacements(response: any[], teams: Team[], groupSize: number): Observable<Object> {
    let poolDistribution: DoublesPoolPlacement[] = [];
    const leftovers = teams.length % groupSize;
    for (const insertedPool of response) {
      for (let i = 0; i < groupSize; i++) {
        const rnd = this.getRandomIntInclusive(0, teams.length - 1);
        const removedTeam = teams.splice(rnd, 1)[0];
        const newPlacement = new DoublesPoolPlacement(insertedPool.insertId, removedTeam.id);
        poolDistribution.push(newPlacement);
      }
    }
    if (leftovers > 0) {
      poolDistribution = this.distributeDoublesLeftovers(poolDistribution, teams, leftovers, response);
    }
    return this.addDoublesPoolPlacements(poolDistribution);
  }

  addDoublesPoolPlacements(poolPlacements: DoublesPoolPlacement[]): Observable<Object> {
    const nestedPayload = {};
    for (let i = 0; i < poolPlacements.length; i++) {
      nestedPayload[i] = {
        'poolId': poolPlacements[i].poolId,
        'teamId': poolPlacements[i].teamId
      };
    }
    return this.http.request('post', '/api/pool_placements/doubles/post', {
      body: nestedPayload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  addTeam(team: Team) {
    const payload = {
      'tournamentId': team.tournamentId,
      'player1Id': team.player1Id,
      'player2Id': team.player2Id
    };
    return this.http.request('post', '/api/teams/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getSinglesRound(tournamentId: number, roundNumber: number) {
    return this.http.request('get', '/api/rounds/get/singles/' + tournamentId.toString() + '/' + roundNumber, {
      headers: {
        'Content-Type': 'application/json'}
    });
  }

  getSinglesPools(roundId) {
    return this.http.request('get', '/api/pools/get/singles/' + roundId.toString(), {
      headers: {
        'Content-Type': 'application/json'}
    });
  }

  getSinglesPoolPlacements(poolId) {
    return this.http.request('get', '/api/pool_placements/get/singles/' + poolId.toString(), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getDoublesRound(tournamentId: number, roundNumber: number) {
    return this.http.request('get', '/api/rounds/get/doubles/' + tournamentId.toString() + '/' + roundNumber, {
      headers: {
        'Content-Type': 'application/json'}
    });
  }

  getDoublesPools(roundId) {
    return this.http.request('get', '/api/pools/get/doubles/' + roundId.toString(), {
      headers: {
        'Content-Type': 'application/json'}
    });
  }

  getDoublesPoolPlacements(poolId) {
    return this.http.request('get', '/api/pool_placements/get/doubles/' + poolId.toString(), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  generateSinglesRoundRobinGameSet(placements, tournamentId, roundId, poolId) {
      let j = 0;
      let i = j + 1;
      while (j < placements.length - 1) {
        while (i < placements.length) {
          const newGame = new SinglesGame(tournamentId, roundId, poolId, false, null, placements[j]['player_id'], placements[i]['player_id']);
          this._gameService.addSinglesGame(newGame).subscribe();
          i++;
        }
        j++;
        i = j + 1;
      }
  }

  generateDoublesRoundRobinGameSet(placements, tournamentId, roundId, poolId) {
    let j = 0;
    let i = j + 1;
    while (j < placements.length - 1) {
      while (i < placements.length) {
        const newGame = new DoublesGame(tournamentId, roundId, poolId, false, null, placements[j]['team_id'], placements[i]['team_id']);
        this._gameService.addDoublesGame(newGame).subscribe();
        i++;
      }
      j++;
      i = j + 1;
    }
  }

  createSinglesGames(tournamentId: number, round: number) {
    this.getSinglesRound(tournamentId, round).subscribe((round) => {
      const roundId = round[0]['id'];
      this.getSinglesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this.getSinglesPoolPlacements(pool['id']).subscribe((placements) => {
            this.generateSinglesRoundRobinGameSet(placements, tournamentId, roundId, poolId);
          });
        }
      });
    });
  }

  createDoublesGames(tournamentId: number, round: number) {
    this.getDoublesRound(tournamentId, round).subscribe((round) => {
      const roundId = round[0]['id'];
      this.getDoublesPools(round[0]['id']).subscribe((poolsResponse: any) => {
        for (const pool of poolsResponse) {
          const poolId = pool['id'];
          this.getDoublesPoolPlacements(pool['id']).subscribe((placements) => {
            this.generateDoublesRoundRobinGameSet(placements, tournamentId, roundId, poolId);
          });
        }
      });
    });
  }


}
