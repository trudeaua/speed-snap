import { BrowserModule } from '@angular/platform-browser';
import { Camera } from "@ionic-native/camera";
import { Contacts } from "@ionic-native/contacts";
import { EmailComposer } from "@ionic-native/email-composer";
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from "@ionic/storage";

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { CreateContactPage } from '../pages/create-contact/create-contact';
import { WelcomePage } from "../pages/welcome/welcome";
import { SettingsPage } from "../pages/settings/settings";
import { ReviewPage } from "../pages/review/review";
import { PastSessionsPage } from "../pages/past-sessions/past-sessions";
import { DataSharingService } from "../shared/data-sharing.service";


@NgModule({
  declarations: [
    MyApp,
    HomePage, WelcomePage, SettingsPage, ReviewPage, CreateContactPage, PastSessionsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot({
      name: '_speedsnapdb',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp, CreateContactPage,
    HomePage, WelcomePage, SettingsPage, ReviewPage, PastSessionsPage
  ],
  providers: [
    StatusBar, Contacts,
    SplashScreen, Camera, DataSharingService, EmailComposer,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }
