import { Component, OnInit } from "@angular/core";
import { PlayerService } from "../Services/player.service";
import { TournamentService } from "../Services/tournament.service";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { BracketService } from "../Services/bracket.service";
import { Player } from "../Players/player";
import { Game } from "../Games/game";
import { GameService } from "../Services/game.service";

@Component({
    templateUrl: 'playoffs.component.html'
})
export class PlayoffsComponent implements OnInit{

    constructor(private _playerService: PlayerService, 
                private _tournyService: TournamentService, 
                private http: HttpClient, private router: Router, 
                private active_route: ActivatedRoute,
                private _gameService: GameService) {
    }

    public players: Player[];
    public playoffId: string;
    public winner: Player;
    public playoff: Object;
    public bracketSize = 0;
    public numberOfRounds = 0;
    public bracket = [];
    public playInRound = [];
    public playoffGames: Game[];
    public tournamentWinner: undefined;

    public isOver = true;

    

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => {
            this.players = players;
            this.playoffId = this.active_route.snapshot.paramMap.get('id');
            this._tournyService.getPlayoff(this.playoffId).subscribe((playoff) => {
                this.tournamentWinner = playoff['winner'];
                this.isOver = this.tournamentWinner;
                this.playoff = playoff;
                this.bracket = playoff['bracket'];
                this.playInRound = this.bracket.shift();
                let notice = document.getElementById('notice');
                notice.textContent = "";
                this._gameService.getPlayoffGames(this.playoffId).subscribe((games) => {
                    this.playoffGames = games;
                });
            });
        });
        
    }

    endTournament() {
        this._tournyService.endTournament(this.playoffId, this.winner, this.convertToName(this.winner)).subscribe(() => this.router.navigateByUrl('/playoffs/' + this.playoffId + '/winner'));
    }

    resetBracket() {
        this._tournyService.getPlayoff(this.playoffId).subscribe((playoff) => {
            this.playoff = playoff;
            this.bracket = playoff['bracket'];
            this.playInRound = this.bracket.shift();
            this.winner = undefined;
        });
    }

    saveBracket() {
        if(confirm('Save the current bracket?')) {
            this._tournyService.updatePlayoff(this.playoff, this.bracket, this.playInRound).subscribe(() => {
                let notice = document.getElementById('notice');
                notice.textContent = "Bracket Successfully Saved \u2713"
            });
        }
    }

    enterPlayoffResult() {
        this.router.navigateByUrl('/playoffs/' + this.playoffId + '/enter_result');
    }

    advancePlayer(player, round) {
        if (round === -1) {
            let openSpotNumber = Math.ceil((this.playInRound.indexOf(player) + 1) / 2);
            let openSpotCount = 0;
            let i = 0;
            while (openSpotCount < openSpotNumber) {
                if (this.playoff['playInSpots'].includes(i)) {
                    openSpotCount ++;
                }
                i ++;
            }
            this.bracket[0][i - 1] = player;
        } else if (this.bracket[round].length === 2) {
            this.winner = player.team;
        } else {
            let openSpot = Math.floor(this.bracket[round].indexOf(player) / 2);
            this.bracket[round + 1][openSpot] = player;
        }
    }

    isEmpty(obj) {
        return JSON.stringify(obj) === '{}';
    }

    returnPower(i): number {
        return Math.pow(2, i);
    }

    indexArray(n: number): any[] {
        return Array(n);
    }

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min; 
    }

    isPowerOfTwo(x) {
        return (Math.log(x)/Math.log(2)) % 1 === 0;
    }

    convertToName(team) {
        let teamString = JSON.stringify(team);
        if (team instanceof Array) {
            let firstName = this.players.find((player) => player.id === team[0]).name;
            let secondName = this.players.find((player) => player.id === team[1]).name;
            return firstName + ' & ' + secondName
        }
        return this.players.find((player) => player.id === team).name
    }
}