import { NgModule, Optional, SkipSelf } from "@angular/core";
import { PlayerService } from "./Players/player.service";
import { ModuleWithProviders } from "@angular/compiler/src/core";
import { TournamentService } from "./Tournaments/tournament.service";
import { BracketService } from "./Brackets/bracket.service";

@NgModule({
    providers: [PlayerService, TournamentService, BracketService]
})
export class CoreModule {
    constructor (@Optional() @SkipSelf() parentModule: CoreModule) {
        if (parentModule) {
          throw new Error(
            'CoreModule is already loaded. Import it in the AppModule only');
        }
      }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: CoreModule
        };
      }

}