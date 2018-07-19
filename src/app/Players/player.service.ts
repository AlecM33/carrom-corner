import { Injectable, Optional, OnInit } from "@angular/core";
import { Player } from "./player";
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { PlayerListComponent } from "./player-list.component";
import { IfObservable } from "rxjs/observable/IfObservable";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';
import { EloService } from "./elo.service";

/* This service provides useful methods in regards to manipulating player data and 
making calls to the database */
@Injectable()
export class PlayerService {


    public players: Player[];

    constructor(private http: HttpClient, private elo_adjuster: EloService) {
    }


    adjustPlayerElo(winningPlayer: Player, losingPlayer: Player) {
    }

    adjustPlayerRecord(gameResult: number) {

    }

    adjustTournamentWins(winningPlayer: Player) {
        
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
        if(this.players !== undefined && this.players.length > 0){
            return Observable.of(this.players);
        } else {
            return this.http.get('http://localhost:3000/players').map(this.populateWithPlayers);
        }
    }

    getKFactor(player, singles): Number {
        let gamesPlayed;
        if (singles) {
            if (player.singlesPlayed <= 20) {
                return 200;
            }
            else if (player.singlesPlayed > 10 && player.singlesPlayed < 40) {
                return 48;
            } else {
                return 32;
            }
        } else {
            if (player.doublesPlayed <= 20) {
                return 200;
            }
            else if (player.doublesPlayed > 10 && player.doublesPlayed < 40) {
                return 48;
            } else {
                return 32;
            }
        }
    }

    getNewDoublesElos(winner1, winner2, loser1, loser2): Array<number> {
        let elos = [];
        let winningKFactor1 = this.getKFactor(winner1, false);
        let winningKFactor2 = this.getKFactor(winner2, false);
        let losingKFactor1 = this.getKFactor(loser1, false);
        let losingKFactor2 = this.getKFactor(loser2, false);
        
        let winningTeamElo = Math.ceil(winner1.elo + winner2.elo) / 2;
        let losingTeamElo = Math.ceil(loser1.elo + loser2.elo) / 2;

        elos.push(this.elo_adjuster.calculateNewElo(winner1.doublesElo, 1, this.elo_adjuster.calculateExpScore(winningTeamElo, losingTeamElo), winningKFactor1));
        elos.push(this.elo_adjuster.calculateNewElo(winner2.doublesElo, 1, this.elo_adjuster.calculateExpScore(winningTeamElo, losingTeamElo), winningKFactor2));
        elos.push(this.elo_adjuster.calculateNewElo(loser1.doublesElo, 0, this.elo_adjuster.calculateExpScore(losingTeamElo, winningTeamElo), losingKFactor1));
        elos.push(this.elo_adjuster.calculateNewElo(loser2.doublesElo, 0, this.elo_adjuster.calculateExpScore(losingTeamElo, winningTeamElo), losingKFactor2));

        return elos;
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
