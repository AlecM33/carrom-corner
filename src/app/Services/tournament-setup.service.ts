import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {SinglesRound} from '../Rounds/singles-round';
import {Observable} from 'rxjs/Observable';
import {DoublesRound} from '../Rounds/doubles-round';
import {forkJoin} from 'rxjs/observable/forkJoin';
import {SinglesPool} from '../Pools/singles-pool';
import {DoublesPool} from '../Pools/doubles-pool';
import {Player} from '../Players/player';
import {SinglesPoolPlacement} from '../Pools/singles-pool-placement';
import {DoublesPoolPlacement} from '../Pools/doubles-pool-placement';
import {Team} from '../Teams/team';
import {Game} from '../Games/game';
import {SinglesGame} from '../Games/singles-game';
import {GameService} from './game.service';
import {DoublesGame} from '../Games/doubles-game';

@Injectable()
export class TournamentSetupService {

  constructor(private http: HttpClient, private _gameService: GameService) {}

  createSinglesRound(roundNumber, size, tournamentId): Observable<Object> {
    const round = new SinglesRound(tournamentId, size, 1);
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

  createDoublesRound(numberOfRounds, size, tournamentId): Observable<Object> {
    const round = new DoublesRound(tournamentId, size, 1);
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

  getFirstSinglesRound(tournamentId: number) {
    return this.http.request('get', '/api/rounds/get/singles/' + tournamentId.toString() + '/1', {
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

  getFirstDoublesRound(tournamentId: number) {
    return this.http.request('get', '/api/rounds/get/doubles/' + tournamentId.toString() + '/1', {
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
          const newGame = new SinglesGame(tournamentId, roundId, poolId, false, placements[j]['player_id'], placements[i]['player_id']);
          this._gameService.addSinglesGame(newGame).subscribe();
          console.log(newGame);
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
        const newGame = new DoublesGame(tournamentId, roundId, poolId, false, placements[j]['team_id'], placements[i]['team_id']);
        this._gameService.addDoublesGame(newGame).subscribe();
        console.log(newGame);
        i++;
      }
      j++;
      i = j + 1;
    }
  }

  createSinglesGames(tournamentId: number) {
    this.getFirstSinglesRound(tournamentId).subscribe((round) => {
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

  createDoublesGames(tournamentId: number) {
    this.getFirstDoublesRound(tournamentId).subscribe((round) => {
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
