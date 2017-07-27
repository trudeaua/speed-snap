import { Camera, CameraOptions } from "@ionic-native/camera";
import { Component } from '@angular/core';
import { NavController, ActionSheetController, AlertController, ToastController, ModalController } from 'ionic-angular';
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";

import { DataSharingService } from "../../shared/data-sharing.service";
import { ReviewPage } from "../review/review";
import { SurveyItem } from "../../models/survey-item.model";
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

  client: string;
  displayErrMsg: boolean;
  defaultUnits: string;
  height: number;
  image: string;
  counter: number = 0;
  location: string;
  name: string;
  notes: string[];
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
    private dataSharing: DataSharingService,
    private modalCtrl: ModalController,
    private storage: Storage,
    private toastCtrl: ToastController,
    public navCtrl: NavController,
    private camera: Camera) {
    this.notes = [];
    this.storage.keys().then(data => {
      console.log(data.toString());
    });
    storage.get('welcomeScreenPresented').then((val: boolean) => {
      if (!val) {
        this.viewDidLoad();
      }
    });
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
    });
  }

  viewDidLoad() {
    this.modalCtrl.create(WelcomePage).present();
  }
  initializeSurveyData(form: NgForm) {
    if (form.value.clientInput && form.value.surveyTypeInput && form.value.locationInput) {
      this.client = form.value.clientInput;
      this.surveyType = form.value.surveyTypeInput;
      this.location = form.value.locationInput;
      this.showDataForm = true;
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
      });
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
          text: 'Add',
          handler: data => {
            this.notes.push(data.noteInput);
            this.toastCtrl.create({
              message: 'Note added.',
              duration: 2500
            }).present();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
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
    });
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
