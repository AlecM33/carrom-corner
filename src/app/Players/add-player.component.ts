import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { PlayerService } from '../Services/player.service';
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
    players: Player[];

    // booleans for validating player form
    nameBlank = false;
    nameInvalid = false;
    nameTaken = false;

    ngOnInit() {
        this._playerService.getPlayers().subscribe((players) => this.players = players);
    }

    // Validates name characters and uniqueness
    validatePlayer() {
        this.nameBlank = this.newPlayerName === undefined || this.newPlayerName === '';
        this.nameInvalid = (/^[a-zA-Z0-9 ]*$/).test(this.newPlayerName) === false || (/^[a-zA-Z0-9 ]*$/).test(this.newPlayerNickname) === false;
        this.nameTaken = this.checkNameUniqueness();
        if (!this.nameBlank && !this.nameInvalid && !this.nameTaken) {
            this.onSubmit();
        }
    }

    // checks database for duplicate names
    checkNameUniqueness() {
        if (this.newPlayerName) {
            for (let player of this.players) {
                if (player.name.toLowerCase() === this.newPlayerName.toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }

    //Function for adding a new player to the database when user submits
    onSubmit() {
        let newPlayer = new Player(undefined, this.newPlayerName, this.newPlayerNickname, 1200, 1200, 0, 0, 0, 0, 0);
        this._playerService.addPlayer(newPlayer).subscribe(() => {
            this.router.navigateByUrl('/players');
        });
    }
}
