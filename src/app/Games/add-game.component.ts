import { Component, OnInit } from "@angular/core";
import { AppComponent } from '../app.component';
import { Router, ActivatedRoute } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { PlayerService } from "../Players/player.service";
import { TournamentService } from "../Tournaments/tournament.service";
import { ViewTournamentComponent } from "../Tournaments/view-tournament.component";

@Component({
    templateUrl: "add-game.component.html"
})

export class AddGameComponent implements OnInit{
    
    winningPlayer: string;
    scoreDifferential: number;
    gameId: any; 
    currentGame: any;
    players = [];
    firstName: string;
    secondName: string;
    tournyName: string;

    constructor (   
                public ps: PlayerService, 
                private ts: TournamentService, 
                private router: Router, 
                private http: HttpClient, 
                private active_route: ActivatedRoute
            ) { 
    }

    // Finds the name of the given player id 
    convertToName(id) {
        if (this.players != undefined) {
            return this.players.find((player) => player.id == id).name
        }
    }

    ngOnInit () {
        this.ps.getPlayers().subscribe((players) => {
            this.players = players;
            this.gameId = this.active_route.snapshot.paramMap.get('id');
                this.tournyName = this.active_route.snapshot.paramMap.get('name');
                this.gameId = parseInt(this.gameId);
                this.http.get('http://localhost:3000/games?id=' + this.gameId).subscribe((game) => {
                    this.currentGame = game;
                    this.firstName = this.convertToName(this.currentGame[0]['id1']);
                    this.secondName = this.convertToName(this.currentGame[0]['id2'])
                });
        });
    }

    // user submits form for game result
    onSubmit () {
        let winningId = this.players.find((player) => player.name === this.winningPlayer).id
        this.ts.updateGame(this.gameId, winningId, this.scoreDifferential).subscribe(() => {
            this.router.navigateByUrl('/tournaments/' + this.tournyName);
        });
    }
}