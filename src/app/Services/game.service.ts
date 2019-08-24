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
                                        jsonGame['playoff_id'],
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
        jsonGame['playoff_id'],
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
                        'playoffId': newGame.playoffId,
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
      'playoffId': newGame.playoffId,
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

  getSinglesGamesInPool(poolId: number, tournamentId: number, roundId: number): Observable<any> {
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

  getPlayerSinglesWinsAndLosses(playerId: number): Observable<any> {
    return this.http.request('get', '/api/games/singles/record/' + playerId, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getPlayerDoublesWinsAndLosses(playerId: number): Observable<any> {
    return this.http.request('get', '/api/games/doubles/record/' + playerId, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  getPlayedDoublesGames() {
    return this.http.request('get', '/api/games/get/doubles', {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithDoublesGames);
  }

  getDoublesGamesInPool(poolId: number, tournamentId: number, roundId: number): Observable<any> {
    return this.http.request('get', '/api/games/get/doubles/' + tournamentId + '/' + roundId + '/' + poolId, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).map(this.populateWithDoublesGames);
  }

  getPlayoffGames(type: string, playoffId: number): Observable<any> {
      return type === 'singles' ? this.http.request('get', '/api/games/get/singles/' + playoffId, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).map(this.populateWithSinglesGames)
      : this.http.request('get', '/api/games/get/doubles/' + playoffId, {
          headers: {
            'Content-Type': 'application/json'
          }
        }).map(this.populateWithDoublesGames);
  }
}
