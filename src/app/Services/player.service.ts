import { Injectable} from '@angular/core';
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
    populateWithPlayers(ob: any[]): Player[] {
        const players = [];

        for (const piece of ob) {
            players.push(new Player(
                                    piece['id'],
                                    piece['name'],
                                    piece['nickname'],
                                    piece['elo'],
                                    piece['doublesElo'],
                                    piece['wins'],
                                    piece['losses'],
                                    piece['totalDiff'],
                                    piece['singlesPlayed'],
                                    piece['doublesPlayed'])
                                );
        }
        return players;
    }

    // Sends a GET request to the database for all players
    getPlayers(): Observable<Player[]> {
        return this.http.get(environment.api_url + '/players').map(this.populateWithPlayers);
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
    addPlayer(newPlayer) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        const payload = { 'name': newPlayer.name,
                        'nickname': newPlayer.nickname,
                        'elo': newPlayer.elo,
                        'doublesElo': newPlayer.doublesElo,
                        'wins': newPlayer.wins,
                        'losses': newPlayer.losses,
                        'totalDiff': newPlayer.totalDiff,
                        'singlesPlayed': newPlayer.singlesPlayed,
                        'doublesPlayed': newPlayer.doublesPlayed
                      };
        return this.http.post(environment.api_url + '/players', payload, httpOptions);
    }

    // Sends a DELETE request to remove the specified player
    deletePlayer(player) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        return this.http.delete(environment.api_url + '/players/' + player['id'], httpOptions);
    }
}
