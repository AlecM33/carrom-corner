import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { PlayerListComponent } from './Players/player-list.component';
import { AddPlayerComponent } from './Players/add-player.component';
import { environment } from '../environments/environment';
import { AddTournamentComponent } from './Tournaments/add-tournament.component'
import { CoreModule } from './core.module';
import { TournamentListComponent } from './Tournaments/tournament-list.component';
import { ViewTournamentComponent } from './Tournaments/view-tournament.component';
import { AddGameComponent } from './Games/add-game.component';
import { PlayoffsComponent } from './Playoffs/playoffs.component';
import { AddPlayoffGameComponent } from './Games/add-playoff-game.component';
import { WinnerComponent } from './Playoffs/winner.component';

@NgModule({
  declarations: [
    AppComponent, PlayerListComponent, AddPlayerComponent, AddTournamentComponent, TournamentListComponent, ViewTournamentComponent, AddGameComponent, PlayoffsComponent, AddPlayoffGameComponent, WinnerComponent
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule, 
    FormsModule,
    HttpModule,
    HttpClientModule,
    JsonpModule,
    RouterModule.forRoot([
      { path: 'players/add', component: AddPlayerComponent },
      { path: 'players', component: PlayerListComponent},
      { path: 'tournament/:type/new', component: AddTournamentComponent},
      { path: 'tournaments', component: TournamentListComponent},
      { path: 'tournaments/:type/:name', component: ViewTournamentComponent},
      { path: ':name/:type/games/:id/enter_result', component: AddGameComponent},
      { path: 'playoffs/:id', component: PlayoffsComponent},
      { path: 'playoffs/:id/enter_result', component: AddPlayoffGameComponent},
      { path: 'playoffs/:id/winner', component: WinnerComponent}
    ]),
    CoreModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
