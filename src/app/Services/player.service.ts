import { Injectable } from '@angular/core';
import { Player } from '../Players/player';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { EloService } from './elo.service';
import { environment } from 'environments/environment';

/* This service provides useful methods in regards to manipulating player data and
making calls to the database */
@Injectable()
export class PlayerService {


    constructor(private http: HttpClient, private elo_adjuster: EloService) {
    }

    // Takes an observable and creates player objects from the data observed
    populateWithPlayers(retrievedPlayers: any[]): Player[] {
        const players = [];

        for (const jsonPlayers of retrievedPlayers) {
            players.push(new Player(
                                    jsonPlayers['id'],
                                    jsonPlayers['name'],
                                    jsonPlayers['nickname'],
                                    jsonPlayers['elo'],
                                    jsonPlayers['doubles_elo'],
                                    jsonPlayers['wins'],
                                    jsonPlayers['losses'],
                                    jsonPlayers['total_diff'],
                                    jsonPlayers['singles_played'],
                                    jsonPlayers['doubles_played'],
                                    jsonPlayers['tournament_wins']
                                    )
                                );
        }
        return players;
    }

    // Sends a GET request to the database for all players
    getPlayers(): Observable<Player[]> {
        return this.http.request('get', '/api/players/get', {
        headers: {
          'Content-Type': 'application/json'}
        }).map(this.populateWithPlayers);
    }

    updatePlayer(id, elo, doublesElo, wins, losses, totalDiff, singlesPlayed, doublesPlayed): Observable<any> {
        return this.http.patch(environment.api_url + '/players/' + id,
        {
            'wins': wins,
            'losses': losses,
            'elo': elo,
            'doublesElo': doublesElo,
            'totalDiff': totalDiff,
            'singlesPlayed': singlesPlayed,
            'doublesPlayed': doublesPlayed
        });
    }

    // Sends a POST request to add a player to the database
    addPlayer(newPlayer): Observable<Object> {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = { 'name': newPlayer.name,
                        'nickname': newPlayer.nickname,
                        'elo': newPlayer.elo,
                        'doubles_elo': newPlayer.doublesElo,
                        'wins': newPlayer.wins,
                        'losses': newPlayer.losses,
                        'total_diff': newPlayer.totalDiff,
                        'singles_played': newPlayer.singlesPlayed,
                        'doubles_played': newPlayer.doublesPlayed,
                        'tournament_wins': newPlayer.tournamentWins
                      };
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
