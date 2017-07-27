import { BrowserModule } from '@angular/platform-browser';
import { Camera } from "@ionic-native/camera";
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from "@ionic/storage";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { WelcomePage } from "../pages/welcome/welcome";
import { SettingsPage } from "../pages/settings/settings";
import { ReviewPage } from "../pages/review/review";
import { DataSharingService } from "../shared/data-sharing.service";


@NgModule({
  declarations: [
    MyApp,
    HomePage, WelcomePage, SettingsPage, ReviewPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '_speedsnapdb'
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage, WelcomePage, SettingsPage, ReviewPage
  ],
  providers: [
    StatusBar,
    SplashScreen, Camera, DataSharingService,
    {provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
