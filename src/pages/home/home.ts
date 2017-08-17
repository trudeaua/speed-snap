import { Camera, CameraOptions } from "@ionic-native/camera";
import { Component } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName } from "@ionic-native/contacts";
import { NavController, ActionSheetController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";

import { DataSharingService } from "../../shared/data-sharing.service";
import { ReviewPage } from "../review/review";
import { SurveyItem } from "../../models/survey-item.model";
import { CreateContactPage } from "../create-contact/create-contact";
import { SettingsPage } from "../settings/settings";
import { WelcomePage } from "../welcome/welcome";
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
  height: number;
  image: string;
  counter: number = 0;
  location: string;
  name: string;
  notes: string[];
  pickedContact: boolean;
  quantity: number;
  showDataForm: boolean;
  signType: string;
  surveyType: string;
  heightUnits: string;
  widthUnits: string;
  width: number;

  constructor(
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private contacts: Contacts,
    private dataSharing: DataSharingService,
    private modalCtrl: ModalController,
    private storage: Storage,
    private toastCtrl: ToastController,
    public navCtrl: NavController,
    private camera: Camera) {
    this.notes = [];
    this.storage.keys().then(data => {
      console.log(data.toString());
    }).catch(err => console.error(err));;
    storage.get('welcomeScreenPresented').then((val: boolean) => {
      if (!val) {
        this.viewDidLoad();
      }
    }).catch(err => console.error(err));;
    storage.get('settings').then((settings: any) => {
      this.settings = settings;
      if (settings) {
        this.defaultUnits = settings.defaultUnits;
        this.heightUnits = settings.defaultUnits;
        this.widthUnits = settings.defaultUnits;
        this.name = settings.name;
      }
      else {
        this.defaultUnits = 'm';
        this.heightUnits = 'm';
        this.widthUnits = 'm';
      }
    }).catch(err => console.error(err));;
  }

  viewDidLoad() {
    this.modalCtrl.create(WelcomePage).present();
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

      let item = new SurveyItem(this.height, this.width, this.quantity, this.signType, this.notes, this.image, this.heightUnits, this.widthUnits);

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

  createContact() {
    let modal = this.modalCtrl.create(CreateContactPage);
    modal.present();
    modal.onDidDismiss((contact: Contact) => {
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
    });
  }

  undoChooseContact() {
    this.client = { name: null, companyName: null, address: null, telephone: null, email: null };
    this.pickedContact = false;
  }

  submitClient() {
    this.showDataForm = true;
  }

  prepareItem(item: SurveyItem) {
    let htmlNotes = '<ul>';
    for (let i = 0; i < item.notes.length; i++) {
      htmlNotes += '<li>' + item.notes[i] + '</li>';
    }
    if (htmlNotes == '<ul>') {
      htmlNotes = '';
    }
    else {
      htmlNotes += '</ul>';
    }
    let date = new Date;
    console.log(date.getTime().toString());
    this.dataSharing.addItem({
      height: item.height,
      width: item.width,
      quantity: item.quantity,
      signType: item.signType,
      htmlNotes: htmlNotes,
      image: item.image,
      heightUnits: item.heightUnits,
      widthUnits: item.widthUnits,
      id: date.getTime().toString(),
      area: item.calcArea(item.height, item.width, item.heightUnits, item.widthUnits)
    });

    this.toastCtrl.create({
      message: 'Added item to log.',
      duration: 1500,
      position: 'bottom'
    }).present();

    this.addAnotherItem();
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
  /**
   * restart the form process to add another pdf
   */
  restart() {
    this.storage.get('settings').then((settings: any) => {
      this.settings = settings;
      if (settings) {
        this.defaultUnits = settings.defaultUnits;
        this.heightUnits = settings.defaultUnits;
        this.widthUnits = settings.defaultUnits;
        this.name = settings.name;
        this.dataSharing.setItems([]);
        this.addAnotherItem();
        this.counter = 0;
        this.showDataForm = false;
      }
    }).catch(err => console.error(err));
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
    let params = { location: this.location, client: this.client, surveyType: this.surveyType, name: this.name };
    this.navCtrl.push(ReviewPage, params);
  }
}
