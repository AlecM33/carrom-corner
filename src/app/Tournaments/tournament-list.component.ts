import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../Services/tournament.service';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';

@Component({
  selector: 'cr-tournaments',
  templateUrl: './tournament-list.component.html',
})

export class TournamentListComponent implements OnInit {

  public tournaments = [];

  constructor(public _tournyService: TournamentService, private http: HttpClient, private router: Router) {
  }

  playoffDefined(id): boolean {
    return this._tournyService.getPlayoff(id) !== undefined;
  }

  viewPlayoff(id) {
    this.router.navigateByUrl('/playoffs/' + id);
  }

  delete(tournament) {
    swal({
      title: 'Delete Tournament',
      text: 'Are you sure you wish to delete this tournament? You will lose all associated game results. Player stats resulting from the tournament will be preserved.',
      buttons: [true, true],
    }).then((wantsToSave) => {
        if (wantsToSave) {
          this.tournaments = [];
          this._tournyService.deleteTournament(tournament, tournament.name).do(() => {
              this._tournyService.getTournaments().subscribe((tournaments) => {
                this.tournaments = tournaments;
              });
          }).subscribe();
        }
      });
  }

  viewTournament(tournament) {
    if (tournament.singles) {
      this.router.navigateByUrl('/tournaments/singles/' + tournament.name);
    } else {
      this.router.navigateByUrl('/tournaments/doubles/' + tournament.name);
    }
  }

  ngOnInit() {
    this._tournyService.getTournaments().subscribe((tournaments) => {
      this.tournaments = tournaments;
    });
  }
}
