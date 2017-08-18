import { Component } from '@angular/core';
import { ActionSheetController, Events, NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { DataSharingService } from "../../shared/data-sharing.service";
import { EmailComposer, EmailComposerOptions } from "@ionic-native/email-composer";
import { Storage } from "@ionic/storage";
declare var cordova: any;

@Component({
    selector: 'page-review',
    templateUrl: 'review.html',
})
export class ReviewPage {
    base64File: string;
    client: any;
    editingIndex: number;
    enableExportBtn: boolean = false;
    location: string;
    name: string;
    newHeight: number;
    newHeightUnits: string;
    newQuantity: number;
    newWidth: number;
    newWidthUnits: string;
    oldHeight: number;
    oldQuantity: number;
    oldWidth: number;
    settings: any;
    showEditForm: boolean;
    surveyItems: any[];
    surveyType: string;
    constructor(
        private actionSheetCtrl: ActionSheetController,
        private alertCtrl: AlertController,
        private dataSharing: DataSharingService,
        private emailComposer: EmailComposer,
        private events: Events,
        public navCtrl: NavController,
        public navParams: NavParams,
        private storage: Storage,
        private toastCtrl: ToastController) {

        this.client = navParams.data.client;
        this.name = navParams.data.name;
        this.location = navParams.data.location;
        this.surveyType = navParams.data.surveyType;
        this.surveyItems = dataSharing.getItems();
        console.log(navParams.data);
        //get settings from storage
        storage.get('settings').then(settings => {
            this.settings = settings;
            console.log(settings);
        });
        //if the edit entry tip was not presented, present it
        storage.get('editEntryTipPresented').then((val: boolean) => {
            if (!val) {
                //toast on how to edit an entry
                this.toastCtrl.create({
                    message: 'Press & hold entries to edit them',
                    position: 'middle',
                    showCloseButton: true,
                    closeButtonText: 'Got it'
                }).present().then(() => {
                    this.storage.set('editEntryTipPresented', true);
                });
            }
        });
        console.log(this.surveyItems);
    }
    /**
     * determine if there is at least one session item recorded, enable export to pdf button if so
     */
    ionViewDidLoad() {
        console.log('ionViewDidLoad ReviewPage');
        if (this.surveyItems.length > 0) {
            this.enableExportBtn = true;
        }
        this.storage.set('sessionInProgress', { client: this.client, items: this.surveyItems });
    }
    /**
     * delete a session item
     * @param item item to be deleted
     */
    deleteEntry(item) {
        let alert = this.alertCtrl.create({
            title: 'Remove Entry',
            subTitle: 'Do you really want to remove this entry?',
            buttons: [
                {
                    text: 'No',
                    role: 'cancel'
                },
                {
                    text: 'Yes',
                    handler: () => {
                        this.dataSharing.removeItem(item);
                        this.showEditForm = false;
                        this.editingIndex = null;
                    }
                }
            ]
        });
        alert.present();
        alert.onDidDismiss(() => {
            this.storage.set('sessionInProgress', { client: this.client, items: this.surveyItems });
        });
    }
    /**
     * edit an item
     * @param item item to be edited
     * @param index index of the item in the surevy items array
     */
    editEntry(item, index) {
        this.showEditForm = true;
        this.editingIndex = index;
        this.oldHeight = Number.parseInt(item.height);
        this.oldWidth = Number.parseInt(item.width);
        this.oldQuantity = Number.parseInt(item.quantity);
        this.newHeight = item.height;
        this.newWidth = item.width;
        this.newQuantity = item.quantity;
        this.newHeightUnits = item.heightUnits;
        this.newWidthUnits = item.widthUnits;
    }
    /**
     * save any changes made to a session item
     * @param form form with new session item content to be saved
     */
    saveChanges() {
        this.surveyItems[this.editingIndex].height = this.newHeight;
        this.surveyItems[this.editingIndex].width = this.newWidth;
        this.surveyItems[this.editingIndex].quantity = this.newQuantity;
        this.surveyItems[this.editingIndex].widthUnits = this.newWidthUnits;
        this.surveyItems[this.editingIndex].heightUnits = this.newHeightUnits;
        this.surveyItems[this.editingIndex].area = this.dataSharing.calcArea(this.newHeight, this.newWidth, this.newHeightUnits, this.newWidthUnits);
        this.storage.set('sessionInProgress', { client: this.client, items: this.surveyItems }).then(() => {
            this.editingIndex = null;
            this.showEditForm = false;
        });
    }

    openShareOptions() {
        let actionSheet = this.actionSheetCtrl.create({
            buttons: [
                {
                    text: 'Print',
                    icon: 'print',
                    handler: () => {
                        this.toPdf('share');
                    }
                },
                {
                    text: 'Share',
                    icon: 'share',
                    handler: () => {
                        //gen pdf, send email w/ pdf as attachment
                        this.toPdf('base64');
                        this.events.subscribe('base64:received', () => {
                            let date = new Date();
                            let email: EmailComposerOptions = {
                                to: this.client.email,
                                attachments: ['base64:SiteSurvey_' + date.toDateString() + '.pdf//' + this.base64File],
                                subject: 'Site Survey',
                                body: "Here's the PDF of the site survey from today.",
                                isHtml: true
                            }
                            setTimeout(() => {
                                this.emailComposer.open(email).catch(err => console.log(err));
                            }, 500);
                        });
                    }
                },
                {
                    text: 'Cancel',
                    role: 'destructive'
                }
            ]
        });
        actionSheet.present();
    }
    /**
     * export all session items to pdf
     */
    toPdf(type: string) {
        let pdfItems = '';
        for (let i = 0; i < this.surveyItems.length; i++) {
            pdfItems += `
            <table style="width: 100%; border: 1px solid black;" class="nobreak">
                <tr>
                    <td style="width: 7%" class="session-item-td">` + (i + 1) + `</td>
                    <td style="width: 64%" class="session-item-td">
                        <img style="width: 100%" src="` + this.surveyItems[i].image + `" alt="img">
                    </td>
                    <td style="width:29%" class="session-item-td">
                        ` + this.surveyItems[i].signType + `
                        <p>` + this.surveyItems[i].htmlNotes + `</p>
                        <p>Dimensions:<br>
                            <ul>
                                <li>Height: `+ this.surveyItems[i].height + ' ' + this.surveyItems[i].heightUnits + `</li>
                                <li>Width: ` + this.surveyItems[i].width + ' ' + this.surveyItems[i].widthUnits + `</li>
                                <li>Area: `+ this.surveyItems[i].area + `</li>
                                <li>Quantity: `+ this.surveyItems[i].quantity + `</li>
                            </ul>
                        </p>
                    </td>
                </tr>
            </table>`
        }

        let date = new Date();
        //determine which contact fields are available, add them to the document if they are
        let clientInfo = "";
        this.client.companyName ? clientInfo += "<li>" + this.client.companyName + "</li>" : null;
        let addressPt1;
        let addressPt2;
        if (this.client.address) {
            addressPt1 = this.client.address.slice(0, this.client.address.indexOf(',')).trim();
            addressPt2 = this.client.address.slice(this.client.address.indexOf(',') + 1).trim();
        }
        if (addressPt1 || addressPt2) {
            addressPt1 ? clientInfo += "<li>" + addressPt1 + "</li>" : null;
            addressPt2 ? clientInfo += "<li>" + addressPt2 + "</li>" : null;
        }
        this.client.telephone ? clientInfo += "<li>" + this.client.telephone + "</li>" : null;
        this.client.email ? clientInfo += "<li>" + this.client.email + "</li>" : null;
        
        let d = date.toDateString().slice(date.toDateString().indexOf(' '));
        cordova.plugins.pdf.htmlToPDF({
            data: `<!DOCTYPE html>
                    <html lang="en">

                    <head>
                    <style>
                        body {
                            font-family: 'Arial', 'sans-serif';
                            position: relative;
                        }

                        .nobreak {
                            page-break-inside: avoid;
                        }

                        #page-header {
                            width: 100%;
                        }

                        .page-header-table {
                            font-size: 12px !important;
                        }

                        #main-content {
                            position: absolute;
                            width: 100%;
                            top: 275px;
                        }

                        .session-item-td {
                            
                            vertical-align: top;
                            padding-left: 5px;
                            padding-right: 5px;
                            padding-top: 5px;
                            font-size: 12px;
                        }

                        #contact-info-container {
                            list-style-type: none;
                            font-size: 13px;
                            text-align: left;
                            vertical-align: top;
                            padding-left: 95px;
                            margin-top: -10px;
                        }
                    </style>
                </head>

                <body>
                    <table style="width: 100%;">
                        <tr>
                            <td style="vertical-align:top; width: 60%; text-align: left">
                                <img style="width:80%;" src="https://www.speedprocanada.com/images/default-source/default-album/new-speedpro-imaging.jpg?sfvrsn=4" alt="logo">
                                <ul id="contact-info-container">
                                    <li>`+ this.settings.companyName + `</li>
                                    <li>`+ this.settings.address + `</li> 
                                    <li>`+ this.settings.city + ', ' + this.settings.province + ' ' + this.settings.postalCode + `</li>
                                    <li>T `+ this.settings.telephone + `</li>
                                    <li>E ` + this.settings.email + `</li>
                                </ul>
                            </td>
                            <td style="vertical-align:top; width: 40%; text-align: right">
                                <h2>Sign Survey</h2>
                            </td>
                        </tr>
                    </table><br>
                    <table id="page-header" class="page-header-table">
                        <tr>
                            <td style="vertical-align:top">Client:</td>
                            <td style="vertical-align:top">` + this.client.name + `</td>
                            <td style="vertical-align:top"></td>
                        </tr>
                        <tr>
                            <td>Location:</td>
                            <td style="vertical-align: top">
                                <ul style="display: inline;list-style-type: none;">
                                    ` + clientInfo + `
                                </ul>
                            </td>
                            <td style="vertical-align:bottom">Inspected By:</td>
                        </tr>
                        <tr>
                            <td style="vertical-align:top">Date Visited:</td>
                            <td style="vertical-align:top">` + d + `</td>
                            <td style="vertical-align:top">`+ this.settings.name + `</td>
                        </tr>
                    </table>
                    <div id="main-content">
                        ` + pdfItems + `
                    </div>
                </body>

                </html>`,
            type: type,
            landscape: "portrait",
            documentSize: "A4"
        }, (success) => {
            if (type == 'base64') {
                this.base64File = success;
                this.events.publish('base64:received');
            }
        }, (err) => console.error('error', err));
    }

}
