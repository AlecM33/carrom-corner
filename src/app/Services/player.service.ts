import { Injectable, Optional, OnInit } from "@angular/core";
import { Player } from "../Players/player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "../Players/player-list.component";
import { IfObservable } from "rxjs/observable/IfObservable";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import { EloService } from "./elo.service";

/* This service provides useful methods in regards to manipulating player data and 
making calls to the database */
@Injectable()
export class PlayerService {


    constructor(private http: HttpClient, private elo_adjuster: EloService) {
    }

    // Takes an observable and creates player objects from the data observed
    populateWithPlayers(ob: any[]): Player[] {
        let players = [];

        for (let piece of ob) {
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
    getPlayers(): Observable<Player[]>{
        return this.http.get('http://localhost:3000/players').map(this.populateWithPlayers);
    }

    updatePlayer(id, elo, doublesElo, wins, losses, totalDiff, singlesPlayed, doublesPlayed): Observable<any> {
        return this.http.patch('http://localhost:3000/players/' + id,
        {
            "wins": wins,
            "losses": losses,
            "elo": elo,
            "doublesElo": doublesElo,
            "totalDiff": totalDiff,
            "singlesPlayed": singlesPlayed,
            "doublesPlayed": doublesPlayed
        });
    }
    
    // Sends a POST request to add a player to the database
    addPlayer(newPlayer) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        let payload = { "name": newPlayer.name,
                        "nickname": newPlayer.nickname,
                        "elo": newPlayer.elo,
                        "doublesElo": newPlayer.doublesElo, 
                        "wins": newPlayer.wins,
                        "losses": newPlayer.losses,
                        "totalDiff": newPlayer.totalDiff,
                        "singlesPlayed": newPlayer.singlesPlayed,
                        "doublesPlayed": newPlayer.doublesPlayed
                      };
        return this.http.post('http://localhost:3000/players', payload, httpOptions);
    }

    // Sends a DELETE request to remove the specified player
    deletePlayer(player) {
        const httpOptions = {headers: new HttpHeaders({ 'Content-Type': 'application/json' })};
        return this.http.delete('http://localhost:3000/players/' + player['id'], httpOptions);
    }
}
