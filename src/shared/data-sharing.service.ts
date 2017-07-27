import { Injectable } from "@angular/core";

@Injectable()
export class DataSharingService {
    items: any[];
    address: string;
    city: string;
    companyName: string;
    postalCode: string;
    province: string;
    telephone: string;
    constructor() {
        this.items = [];
    }
    getItems() {
        return this.items;
    }

    setItems(items: any[]) {
        this.items = items;
    }

    addItem(item: any) {
        this.items.push(item);
    }

    removeItem(item) {
        let index = this.getItemIndexById(item.id, this.items);
        this.items.splice(index, 1);
    }

    getItemIndexById(id, array: any[]) {
        for (let i = 0; i < array.length; i++) {
            if (id == array[i].id) {
                return i;
            }
        }
        return null;
    }

    replaceItem(item: any, index: number) {
        this.items[index] = item;
    }


}