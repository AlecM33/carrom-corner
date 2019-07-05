import { Component, OnInit } from '@angular/core';
import { Player } from './player';
import { PlayerService } from '../Services/player.service';
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
        this.nameInvalid =
          (/^[a-zA-Z0-9 ]*$/).test(this.newPlayerName) === false || (/^[a-zA-Z0-9 ]*$/).test(this.newPlayerNickname) === false;
        this.nameTaken = this.checkNameUniqueness();
        if (!this.nameBlank && !this.nameInvalid && !this.nameTaken) {
            this.onSubmit();
        }
    }

    // checks database for duplicate names
    checkNameUniqueness() {
        if (this.players && this.newPlayerName) {
            for (const player of this.players) {
                if (player.name.toString().toLowerCase() === this.newPlayerName.toString().toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }

    // Function for adding a new player to the database when user submits
    onSubmit() {
        const newPlayer = new Player(undefined, this.newPlayerName, this.newPlayerNickname, 1200, 1200, 0, 0, 0, 0, 0, 0);
        this._playerService.addPlayer(newPlayer).subscribe(() => {
            this.router.navigateByUrl('/players');
        });
    }
}
