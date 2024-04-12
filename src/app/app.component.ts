import { Component } from '@angular/core';
import { ThemeService } from './shared/services/theme.service';
import { themeTypesEnum } from './shared/services/engine.model';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public theme = themeTypesEnum.light;
  public themeTypes = themeTypesEnum;
  constructor(private themeService: ThemeService, private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  clickToggle() {
    this.theme = this.theme === themeTypesEnum.light ? themeTypesEnum.dark : themeTypesEnum.light;
    this.themeService.themeObservable.next(this.theme);
  }

  redirect() {

  }
}
