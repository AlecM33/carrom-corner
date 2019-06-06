import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from './Players/player-list.component';
import { AddPlayerComponent } from './Players/add-player.component';
import { AddTournamentComponent } from './Tournaments/add-tournament.component';
import { CoreModule } from './core.module';
import { TournamentListComponent } from './Tournaments/tournament-list.component';
import { ViewTournamentComponent } from './Tournaments/view-tournament.component';
import { AddGameComponent } from './Games/add-game.component';
import { PlayoffsComponent } from './Playoffs/playoffs.component';
import { WinnerComponent } from './Playoffs/winner.component';
import { HomepageComponent } from './Homepage/homepage-component';
import {NgbModule, NgbTooltipConfig} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent, PlayerListComponent, AddPlayerComponent, AddTournamentComponent,
    TournamentListComponent, ViewTournamentComponent, AddGameComponent, PlayoffsComponent,
    WinnerComponent, HomepageComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    RouterModule.forRoot([
      { path: 'players/add', component: AddPlayerComponent },
      { path: 'players', component: PlayerListComponent},
      { path: 'tournament/:type/new', component: AddTournamentComponent},
      { path: 'tournaments', component: TournamentListComponent},
      { path: 'tournaments/:type/:name', component: ViewTournamentComponent},
      { path: ':name/:type/games/:id/enter_result', component: AddGameComponent},
      { path: 'playoffs/:id', component: PlayoffsComponent},
      { path: 'playoffs/:id/winner', component: WinnerComponent},
      { path: '', component: HomepageComponent}
    ]),
    CoreModule.forRoot()
  ],
  providers: [ NgbTooltipConfig],
  bootstrap: [AppComponent]
})
export class AppModule { }
