import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SinglesPool } from '../Pools/singles-pool';
import { environment } from 'environments/environment';
import {SinglesGame} from '../Games/singles-game';
import {DoublesGame} from '../Games/doubles-game';

@Injectable()
export class GameService {

    constructor(private http: HttpClient) {}

    populateWithSinglesGames(resp: any[]): SinglesGame[] {
        const games = [];

        for (const jsonGame of resp) {
          const newGame = new SinglesGame(
                                        jsonGame['tournament_id'],
                                        jsonGame['round_id'],
                                        jsonGame['pool_id'],
                                        jsonGame['playoff'],
                                        jsonGame['player1_id'],
                                        jsonGame['player2_id']
                                        );
          newGame.id = jsonGame['id'];
          newGame.winner = jsonGame['winner'];
          newGame.loser = jsonGame['loser'];
          newGame.validator = jsonGame['validator'];
          newGame.coinFlipWinner = jsonGame['coin_flip_winner'];
          newGame.differential = jsonGame['differential'];
          games.push(newGame);
        }
        return games;
    }

  populateWithDoublesGames(resp: any[]): DoublesGame[] {
    const games = [];

    for (const jsonGame of resp) {
      const newGame = new DoublesGame(
        jsonGame['tournament_id'],
        jsonGame['round_id'],
        jsonGame['pool_id'],
        jsonGame['playoff'],
        jsonGame['team1_id'],
        jsonGame['team2_id']
      );
      newGame.id = jsonGame['id'];
      newGame.winner = jsonGame['winner'];
      newGame.loser = jsonGame['loser'];
      newGame.validator = jsonGame['validator'];
      newGame.coinFlipWinner = jsonGame['coin_flip_winner'];
      newGame.differential = jsonGame['differential'];
      games.push(newGame);
    }
    return games;
  }

    addSinglesGame(newGame: SinglesGame) {
        const payload = {
                        'playoff': newGame.playoff,
                        'tournamentId': newGame.tournamentId,
                        'roundId': newGame.roundId,
                        'poolId': newGame.poolId,
                        'player1Id': newGame.player1Id,
                        'player2Id': newGame.player2Id,
                      };
      return this.http.request('post', '/api/games/singles/post', {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  addDoublesGame(newGame: DoublesGame) {
    const payload = {
      'playoff': newGame.playoff,
      'tournamentId': newGame.tournamentId,
      'roundId': newGame.roundId,
      'poolId': newGame.poolId,
      'team1Id': newGame.team1Id,
      'team2Id': newGame.team2Id,
    };
    return this.http.request('post', '/api/games/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

    updateSinglesGame(game: SinglesGame): Observable<any> {
      const payload = {
        'winner': game.winner,
        'loser': game.loser,
        'validator': game.validator,
        'coin_flip_winner': game.coinFlipWinner,
        'differential': game.differential,
      };
      return this.http.request('post', '/api/games/singles/update/' + game.id, {
        body: payload,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

  updateDoublesGame(game: DoublesGame): Observable<any> {
    const payload = {
      'winner': game.winner,
      'loser': game.loser,
      'validator': game.validator,
      'coin_flip_winner': game.coinFlipWinner,
      'differential': game.differential,
    };
    return this.http.request('post', '/api/games/doubles/update/'  + game.id, {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getSinglesGamesInPool(poolId: number, tournamentId: number, roundId: number) {
    return this.http.request('get', '/api/games/get/singles/' + tournamentId + '/' + roundId + '/' + poolId, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithSinglesGames);
  }

  getPlayedSinglesGames() {
    return this.http.request('get', '/api/games/get/singles', {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithSinglesGames);
  }

  getPlayedDoublesGames() {
    return this.http.request('get', '/api/games/get/doubles', {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithDoublesGames);
  }

  getDoublesGamesInPool(poolId: number, tournamentId: number, roundId: number) {
    return this.http.request('get', '/api/games/get/doubles/' + tournamentId + '/' + roundId + '/' + poolId, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithDoublesGames);
  }

    // addPool(newPool: SinglesPool) {
    //     const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
    //     const payload = {
    //       'tournamentId': newPool.tournamentId,
    //       'pools': newPool.pools,
    //       'tournyName': newPool.tournyName
    //     };
    //     return this.http.post(environment.api_url + '/pools', payload, httpOptions);
    // }
}
