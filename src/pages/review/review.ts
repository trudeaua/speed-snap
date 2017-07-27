import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { DataSharingService } from "../../shared/data-sharing.service";
import { NgForm } from "@angular/forms/src/forms";
import { Storage } from "@ionic/storage";
declare var cordova: any;

@Component({
    selector: 'page-review',
    templateUrl: 'review.html',
})
export class ReviewPage {
    client: string;
    editingIndex: number;
    enableExportBtn: boolean = false;
    location: string;
    name: string;
    newHeightUnits: string;
    newWidthUnits: string;
    oldHeight: number;
    oldQuantity: number;
    oldWidth: number;
    settings: any;
    showEditForm: boolean;
    surveyItems: any[];
    surveyType: string;
    constructor(private alertCtrl: AlertController, private toastCtrl: ToastController, private dataSharing: DataSharingService, private storage: Storage, public navCtrl: NavController, public navParams: NavParams) {
        this.client = navParams.data.client;
        this.name = navParams.data.name;
        this.location = navParams.data.location;
        this.surveyType = navParams.data.surveyType;
        this.surveyItems = dataSharing.getItems();
        console.log(navParams.data);
        storage.get('settings').then(settings => {
            this.settings = settings;
            console.log(settings);
        });
        storage.get('editEntryTipPresented').then((val: boolean) => {
            if (!val) {
                this.toastCtrl.create({
                    message: 'Press & hold entries to edit them',
                    position: 'middle',
                    showCloseButton: true,
                    closeButtonText: 'Got it'
                }).present().then(() => {
                    this.storage.set('editEntryTipPresented', true);
                });
            }
        })
        console.log(this.surveyItems);
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ReviewPage');
        if (this.surveyItems.length > 0) {
            this.enableExportBtn = true;
        }
    }

    deleteEntry(item) {
        this.alertCtrl.create({
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
                    }
                }
            ]
        }).present();
    }

    editEntry(item, index) {
        this.showEditForm = true;
        this.editingIndex = index;
        this.oldHeight = Number.parseInt(item.height);
        this.oldWidth = Number.parseInt(item.width);
        this.oldQuantity = Number.parseInt(item.quantity);
        this.newHeightUnits = item.heightUnits;
        this.newWidthUnits = item.widthUnits;
    }

    saveChanges(form: NgForm) {
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].height = form.value.newHeightInput : this.surveyItems[this.editingIndex].height = this.oldHeight;
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].width = form.value.newWidthInput : this.surveyItems[this.editingIndex].width = this.oldWidth;
        form.value.newHeightInput ? this.surveyItems[this.editingIndex].quantity = form.value.newQtyInput : this.surveyItems[this.editingIndex].quantity = this.oldQuantity;
        this.surveyItems[this.editingIndex].widthUnits = this.newWidthUnits;
        this.surveyItems[this.editingIndex].heightUnits = this.newHeightUnits;
        this.editingIndex = null;
        this.showEditForm = false;
    }
    //gen PDF
    toPdf() {
        let pdfItems = '';
        for (let i = 0; i < this.surveyItems.length; i++) {
            pdfItems += `<table class="session-item nobreak">
            <tr>
                <td class="picture-cell">
                    <img src="` + this.surveyItems[i].image + `" alt="img">
                </td>
                <td>
                    Sign Type: ` + this.surveyItems[i].signType + `
                    <table class="item-table">
                        <tr>
                            <td>Height: `+ this.surveyItems[i].height + ' ' + this.surveyItems[i].heightUnits + `</td>
                            <td>Width: ` + this.surveyItems[i].width + ' ' + this.surveyItems[i].widthUnits + `</td>
                            <td>Quantity: `+ this.surveyItems[i].quantity + `</td>
                        </tr>
                        <tr>
                            <td>Area: ` + this.surveyItems[i].area + `</td>
                        </tr>
                    </table><br>
                    Notes:
                    ` + this.surveyItems[i].htmlNotes + `
                </td>
            </tr>
        </table>`
        }

        let date = new Date;
        let d = date.toDateString().slice(date.toDateString().indexOf(' '));
        cordova.plugins.pdf.htmlToPDF({
            data: `<!DOCTYPE html>
<html lang="en">

<head>
    <style>
        body {
            font-family: 'Trebuchet MS', sans-serif;
            position: relative;
            margin-left: 90px;
            margin-right: 90px;
        }
        .nobreak {
            page-break-inside: avoid;
        }
        #page-header {
            width: 100%;
        }

        #left-page-header {
            width: 40%;
            position: absolute;
            left: 0px;
        }

        #left-page-header>img {
            width: 80%;
        }

        #contact-text {
            position: absolute;
            top: 46px;
            left: 0px;
            line-height: 1px;
        }

        #survey-by {
            position: absolute;
            top: 150px;
            left: 10px;
        }

        #right-page-header {
            width: 60%;
            position: absolute;
            right: 0px;
        }

        #survey-type {
            text-align: right;
        }

        #survey-info-table {
            position: absolute;
            left: 90px;
        }

        #survey-info-table>table {
            border-spacing: 16px;
        }

        #survey-info-table>td,
        #survey-info-table>th {
            white-space: nowrap;
            font-size: 16px;
            padding-right: 10em;
        }

        #mid-border {
            border-bottom: 1px solid black;
            width: 100%;
            position: absolute;
            top: 265px;
        }

        #main-content {
            position: absolute;
            width: 100%;
            top: 275px;
        }

        .picture-cell {
            width: 40%;
        }

        .picture-cell>img {
            width: 100%;
        }

        .item-table {
            border-spacing: 12px;
        }

        .item-table > tr > th, .item-table > tr > td {
          vertical-align: top;
        }

        .session-item {
            border: 1px solid black;
        }
    </style>
</head>

<body>
    <div id="page-header">
        <div id="left-page-header">
            <img src="http://chambermaster.blob.core.windows.net/images/customers/1114/members/19774/logos/MEMBER_PAGE_HEADER/SPEEDPRO_LOGO_2.jpg" alt="img">
            <div id="contact-text">
                <p>`+ this.settings.companyName + `</p>
                <p>`+ this.settings.address + `</p>
                <p>`+ this.settings.city + ' ,' + this.settings.province + ' ' + this.settings.postalCode + `</p>
                <p>T `+ this.settings.telephone + `</p>
            </div>
            <div id="survey-by">
                <p>Survey Completed By:</p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`+ this.settings.name + `</p>
            </div>
        </div>
        <div id="right-page-header">
            <h3 id="survey-type">`+ this.surveyType + `</h3>
            <div id="survey-info-table">
                <table>
                    <tr>
                        <td>Date Requested:</td>
                        <td>Date Completed:</td>
                    </tr>
                    <tr>
                        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` + d + `</td>
                        <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;` + d + `</td>
                    </tr>
                </table>
                <div id="survey-location-box">
                    <p>Customer Location:</p>
                    <p>`+ this.client + ',<br>' + this.location + `</p>
                </div>
            </div>
        </div>
        <div id="mid-border"></div>
    </div>
    <div id="main-content">
        ` + pdfItems + `
    </div>
</body>

</html>`,
            type: "share",
            landscape: "portrait",
            documentSize: "A4"
        }, (success) => console.log('success', success), (err) => console.error('error', err));
    }

}
