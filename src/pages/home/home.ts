import { Camera, CameraOptions } from "@ionic-native/camera";
import { Component } from '@angular/core';
import { Contacts, Contact } from "@ionic-native/contacts";
import { NavController, Events, ActionSheetController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";

import { DataSharingService } from "../../shared/data-sharing.service";
import { ReviewPage } from "../review/review";
import { SurveyItem } from "../../models/survey-item.model";
import { CreateContactPage } from "../create-contact/create-contact";
import { SettingsPage } from "../settings/settings";
import { WelcomePage } from "../welcome/welcome";
import { PastSessionsPage } from "../past-sessions/past-sessions";
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  settings: any;
  address: string;
  city: string;
  companyName: string;
  postalCode: string;
  province: string;
  telephone: string;

  client = { name: null, companyName: null, address: null, telephone: null, email: null };
  displayErrMsg: boolean;
  defaultUnits: string;
  firstName: string;
  height: number;
  image: string;
  uId: number;
  counter: number = 0;
  location: string;
  name: string;
  notes: string[];
  pickedContact: boolean;
  quantity: number;
  showDataForm: boolean;
  showPageContent: boolean;
  signType: string;
  storedItems: any[];
  surveyType: string;
  heightUnits: string;
  widthUnits: string;
  width: number;

  constructor(
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private contacts: Contacts,
    private dataSharing: DataSharingService,
    private events: Events,
    private modalCtrl: ModalController,
    private storage: Storage,
    private toastCtrl: ToastController,
    public navCtrl: NavController,
    private camera: Camera) {
    this.notes = [];
    this.showPageContent = false;
    this.storedItems = [];
    this.storage.keys().then(data => {
      console.log(data.toString());
    }).catch(err => console.error(err));
    //if the welcome screen was not presented, present it
    this.storage.get('welcomeScreenPresented').then((val: boolean) => {
      if (!val) {
        this.showWelcomeScreen();
      }
      else {
        this.openPastSessionsPage();
      }
    }).catch(err => console.error(err));

    this.getUserSettings();

    this.events.subscribe('updateCounter', count => {
      this.counter = count;
    });
  }
  /**
   * present the welcome screen modal
   */
  showWelcomeScreen() {
    let modal = this.modalCtrl.create(WelcomePage, {}, {
      enableBackdropDismiss: false
    });
    modal.present();
    modal.onWillDismiss(() => {
      this.openPastSessionsPage();
      this.getUserSettings();
    });
  }
  /**
   * get user settings from storage
   */
  getUserSettings() {
    this.storage.get('settings').then((settings: any) => {
      this.settings = settings;
      if (settings != null) {
        this.defaultUnits = settings.defaultUnits;
        this.heightUnits = settings.defaultUnits;
        this.widthUnits = settings.defaultUnits;
        this.name = settings.name;
        this.firstName = this.name.slice(0, this.name.indexOf(' '));
      }
    }).catch(err => console.error(err));
  }
  /**
   * process form data
   * @param form form with data to be processed
   */
  process(form: NgForm) {
    if (form.value.heightInput && form.value.widthInput && form.value.qtyInput && form.value.signTypeInput && this.image && this.heightUnits && this.widthUnits) {
      this.height = form.value.heightInput;
      this.width = form.value.widthInput;
      this.quantity = form.value.qtyInput;
      this.signType = form.value.signTypeInput;

      let date = new Date();
      let id = date.getTime().toString();
      let item = new SurveyItem(this.height, this.width, this.quantity, this.signType, this.notes, this.image, this.heightUnits, this.widthUnits, id);

      this.prepareItem(item);
      this.counter++;
      this.storage.get('settings').then(settings => {
        this.settings = settings;
        if (settings) {
          this.defaultUnits = settings.defaultUnits;
          this.heightUnits = settings.defaultUnits;
          this.widthUnits = settings.defaultUnits;
          form.reset();
        }
      }).catch(err => console.error(err));;
    }
    else {
      let alert = this.alertCtrl.create({
        title: 'Form not complete',
        subTitle: 'Please complete all fields.',
        buttons: [
          {
            text: 'Okay',
            role: 'cancel'
          }
        ]
      });
      alert.present();
    }
  }
  /**
   * pick a client from the phone's contacts, and extract the fields associated wiht it
   */
  chooseContact() {
    this.contacts.pickContact().then((contact: Contact) => {
      console.log(contact);
      if (contact.addresses) {
        for (let i = 0; i < contact.addresses.length; i++) {
          if (contact.addresses[i].type.toLowerCase() == "work") {
            this.client.address = contact.addresses[i].formatted;
            break;
          }
          else {
            this.client.address = contact.addresses[i].formatted;
          }
        }
      }
      contact.name.formatted ? this.client.name = contact.name.formatted : this.client.name = contact.displayName;
      if (contact.emails) {
        for (let i = 0; i < contact.emails.length; i++) {
          if (contact.emails[i].type.toLowerCase() == "work") {
            this.client.email = contact.emails[i].value;
            break;
          }
          else {
            this.client.email = contact.emails[i].value;
          }
        }
      }
      if (contact.organizations) {
        for (let i = 0; i < contact.organizations.length; i++) {
          if (contact.organizations[i].type.toLowerCase() == "work") {
            this.client.companyName = contact.organizations[i].name;
            break;
          }
          else {
            this.client.companyName = contact.organizations[i].name;
          }
        }
      }
      if (contact.phoneNumbers) {
        for (let i = 0; i < contact.phoneNumbers.length; i++) {
          if (contact.phoneNumbers[i].type.toLowerCase() == "work") {
            this.client.telephone = contact.phoneNumbers[i].value;
            break;
          }
          else {
            this.client.telephone = contact.phoneNumbers[i].value;
          }
        }
      }
      this.pickedContact = true;
    }).catch(err => { console.error(err) });
  }
  /**
   * create a new contact on a modal
   */
  createContact() {
    let modal = this.modalCtrl.create(CreateContactPage);
    modal.present();
    modal.onDidDismiss((contact: Contact) => {
      if (contact) {
        this.client.address = contact.addresses[0].formatted;
        if (contact.organizations.length > 0) {
          this.client.companyName = contact.organizations[0].name;
        }
        if (contact.emails.length > 0) {
          this.client.email = contact.emails[0].value;
        }
        this.client.name = contact.name.formatted;
        if (contact.phoneNumbers.length > 0) {
          this.client.telephone = contact.phoneNumbers[0].value;
        }
        this.pickedContact = true;
      }
    });
  }
  /**
   * reverts the client info back to empty, prompts user to choose a contact again
   */
  undoChooseContact() {
    this.client = { name: null, companyName: null, address: null, telephone: null, email: null };
    this.pickedContact = false;
  }
  /**
   * client info chosen, begin survey session
   */
  submitClient() {
    this.storage.get('sessionsInProgress').then((sessionData: any[]) => {
      let sessions;
      if (sessionData == null) {
        sessions = [];
      }
      else {
        sessions = sessionData;
      }
      console.log(sessionData);
      let d = new Date();
      this.uId = d.getTime()
      sessions.push({ client: this.client, items: [], id: this.uId, date: this.dataSharing.getCurrentDate() });
      this.storage.set('sessionsInProgress', sessions);
      this.showDataForm = true;
    });
  }
  /**
   * prepare an item to be exported to pdf
   * @param item A survey item recorded in the session
   */
  prepareItem(item: SurveyItem) {
    let htmlNotes = 'Notes: <ul>';
    for (let i = 0; i < item.notes.length; i++) {
      htmlNotes += '<li>' + item.notes[i] + '</li>';
    }
    if (htmlNotes == 'Notes: <ul>') {
      htmlNotes = '';
    }
    else {
      htmlNotes += '</ul>';
    }
    let surveyItem = {
      height: item.height,
      width: item.width,
      quantity: item.quantity,
      signType: item.signType,
      htmlNotes: htmlNotes,
      image: item.image,
      heightUnits: item.heightUnits,
      widthUnits: item.widthUnits,
      id: item.id,
      area: this.dataSharing.calcArea(item.height, item.width, item.heightUnits, item.widthUnits)
    }
    this.dataSharing.addItem(surveyItem);
    //this.storedItems.push(surveyItem);
    this.storage.get('sessionsInProgress').then((sessionData: any) => {
      let index = this.dataSharing.getSessionIndexById(this.uId, sessionData);
      console.log(index);
      if (index == null) {
        sessionData.push({ client: this.client, items: this.storedItems, id: this.uId, date: this.dataSharing.getCurrentDate() });
      }
      else {
        sessionData[index] = { client: this.client, items: this.storedItems, id: this.uId, date: this.dataSharing.getCurrentDate() };
      }
      this.storage.set('sessionsInProgress', sessionData).then(() => {
        this.toastCtrl.create({
          message: 'Added item to log.',
          duration: 1500,
          position: 'bottom'
        }).present();

        this.addAnotherItem();
      });
    });
  }
  /**
   * open the camera and take a picture
   */
  takePicture() {
    let sourceType: number;
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Insert Picture',
      buttons: [
        {
          text: 'Choose From Photos',
          icon: 'image',
          handler: () => {
            sourceType = 0;
            picture(sourceType);
          }
        },
        {
          text: 'Take Picture With Camera',
          icon: 'camera',
          handler: () => {
            sourceType = 1;
            picture(sourceType);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
    var self = this;
    function picture(sourceType) {
      const options: CameraOptions = {
        quality: 100,
        targetWidth: window.screen.width,
        destinationType: self.camera.DestinationType.DATA_URL,
        encodingType: self.camera.EncodingType.JPEG,
        mediaType: self.camera.MediaType.PICTURE,
        saveToPhotoAlbum: true,
        cameraDirection: 0,
        sourceType: sourceType
      }
      self.camera.getPicture(options).then(imageData => {
        self.image = 'data:image/jpeg;base64,' + imageData;
      }).catch(err => console.error(err));
    }
  }
  /**
   * add a note
   */
  addNote() {
    let alert = this.alertCtrl.create({
      title: "Add Note",
      inputs: [
        {
          placeholder: 'Start Typing...',
          name: 'noteInput'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Add',
          handler: data => {
            this.notes.push(data.noteInput);
            this.toastCtrl.create({
              message: 'Note added.',
              duration: 2500
            }).present();
          }
        }
      ]
    });
    alert.present();
  }
  /**
   * clear the form and prepare it to add another item
   */
  addAnotherItem() {
    this.height = null;
    this.width = null;
    this.quantity = null;
    this.image = null;
    this.notes = [];
    this.heightUnits = this.defaultUnits;
    this.widthUnits = this.defaultUnits;
  }

  openPastSessionsPage() {
    let modal = this.modalCtrl.create(PastSessionsPage);
    modal.present();
    modal.onWillDismiss((session: any) => {
      this.showPageContent = true;
      this.client = session.client.name ? session.client : this.client;
      this.dataSharing.setItems(session.items);
      this.storedItems = session.items;
      this.counter = session.items.length;
      this.uId = session.id;
      if (session.client.name != null) {
        this.pickedContact = true;
        this.showDataForm = true;
        this.toastCtrl.create({
          message: 'Previous session restored.',
          position: 'middle',
          duration: 2000
        }).present();
      }
      else {
        this.pickedContact = false;
        this.showDataForm = false;
      }
    });
  }

  resetValues() {
    this.addAnotherItem();
    this.storedItems = [];
  }
  /**
   * open the settings page
   */
  openSettings() {
    this.modalCtrl.create(SettingsPage).present();
  }
  /**
   * navigate to the review page
   */
  goToReviewPage() {
    let params = { location: this.location, client: this.client, surveyType: this.surveyType, name: this.name, id: this.uId };
    this.navCtrl.push(ReviewPage, params);
  }
}