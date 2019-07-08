import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { SinglesPool } from '../Pools/singles-pool';
import { Game } from '../Games/game';
import { environment } from 'environments/environment';
import {SinglesGame} from '../Games/singles-game';
import {DoublesGame} from '../Games/doubles-game';

@Injectable()
export class GameService {

    constructor(private http: HttpClient) {}

    populateWithGames(ob: any[]): Game[] {
        const games = [];

        for (const piece of ob) {
            games.push(
                new Game(
                        piece['id'],
                        piece['playoff'],
                        piece['tournamentId'],
                        piece['scheduleIndex'],
                        piece['team1'],
                        piece['team2'],
                        piece['winner'],
                        piece['differential'],
                        piece['validator']
                    ));
        }
        return games;
    }

    getGames(id): Observable<Game[]> {
        return this.http.get(environment.api_url + '/games?tournamentId=' + id + '&playoff=false').map(this.populateWithGames);
    }

    getPlayoffGames(id): Observable<Game[]> {
        return this.http.get(environment.api_url + '/games?tournamentId=' + id + '&playoff=true').map(this.populateWithGames);
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
      'player1Id': newGame.team1Id,
      'player2Id': newGame.team2Id,
    };
    return this.http.request('post', '/api/games/doubles/post', {
      body: payload,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

    updateGame(id, winner, differential, validator): Observable<any> {
        return this.http.patch(environment.api_url + '/games/' + id,
        {
            'winner': winner,
            'differential': differential,
            'validator': validator
        });
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
