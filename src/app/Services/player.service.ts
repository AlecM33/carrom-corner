import { Injectable } from '@angular/core';
import { Player } from '../Players/player';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { EloService } from './elo.service';
import { environment } from 'environments/environment';
import {map, tap} from 'rxjs/operators';

/* This service provides useful methods in regards to manipulating player data and
making calls to the database */
@Injectable()
export class PlayerService {

  private _players: Player[];

  // Convert Object[] => Player[] (Object must represent a real player, though. No funny business.)
  private static ingestRawPlayerData(retrievedPlayers: any[]): Player[] {
    const result: Player[] = [];
    const expectedProperties = [
      'id', 'name', 'nickname', 'tournament_wins'
    ];
    for (const jsonPlayers of retrievedPlayers) {
      if (!expectedProperties.every((prop) => jsonPlayers.hasOwnProperty(prop))) continue;
      const newPlayer = new Player(jsonPlayers['name'], jsonPlayers['nickname']);
      newPlayer['id'] = jsonPlayers['id'];
      newPlayer['tournamentWins'] = jsonPlayers['tournament_wins'];
      result.push(newPlayer);
    }
    return result;
  }

    constructor(private http: HttpClient, private elo_adjuster: EloService) {
      this._players = [];
    }

    // Sends a GET request to the database for all players
    public getPlayers(forceRefresh= false): Observable<Player[]> {
    console.log(forceRefresh);
      if (forceRefresh || this._players.length < 1) {
        return this.http.request('get', '/api/players/get', {
          headers: {
            'Content-Type': 'application/json'
          }
        }).pipe(
          map(PlayerService.ingestRawPlayerData),
          tap((players) => this._players = players)
        );
      }
      return Observable.of(this._players);
    }

    // Sends a POST request to add a player to the database
    addPlayer(newPlayer): Observable<Object> {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = { 'name': newPlayer.name, 'nickname': newPlayer.nickname };
        return this.http.request('post', '/api/players/post', {
          body: payload,
          headers: {
            'Content-Type': 'application/json'
          }
        });
    }

    // Sends a DELETE request to remove the specified player
    deletePlayer(player): Observable<Object> {
        return this.http.delete('/api/players/delete/' + player.id, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    }
}
