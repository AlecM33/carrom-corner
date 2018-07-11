import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { PlayerService } from './player.service';
import { AppComponent } from '../app.component';
import { NgModel } from '@angular/forms';
import { FormsModule } from '@angular/forms'
import { PlayerListComponent } from './player-list.component';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    templateUrl: 'add-player.component.html'
})
export class AddPlayerComponent implements OnInit {

    constructor(private _playerService: PlayerService, private router: Router) {
    }

    newPlayerName: string;
    newPlayerNickname: string;
    players: any;
    nameBlank = false;
    nameInvalid = false;
    nameTaken = false;

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => this.players = players);
    }

    validatePlayer() {
        this.nameBlank = this.newPlayerName === undefined || this.newPlayerName === '';
        let regex = new RegExp('^[a-zA-Z0-9 ]*$');
        this.nameInvalid = regex.test(this.newPlayerName) === false || regex.test(this.newPlayerNickname) === false;
        this.nameTaken = this.checkPlayerName();
        if (!this.nameBlank && !this.nameInvalid && !this.nameTaken) {
            this.onSubmit();
        }
    }

    checkPlayerName() {
        if (this.newPlayerName) {
            for (let player of this.players) {
                if (player.name === this.newPlayerName) {
                    return true;
                }
            }
        }
        return false;
    }

    //Function for adding a new player to the database when user submits
    onSubmit() {
        let newPlayer = {name: this.newPlayerName, nickname: this.newPlayerNickname};
        this._playerService.addPlayer(newPlayer).subscribe(() => {
            this.router.navigateByUrl('/players');
        });
    }
}
