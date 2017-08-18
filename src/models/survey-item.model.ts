export class SurveyItem {
    public height: number;
    public heightUnits: string;
    public id: string;
    public image: string;
    public notes: string[];
    public quantity: number;
    public signType: string;
    public width: number;
    public widthUnits: string;

    constructor(height: number, width: number, quantity: number, signType: string, notes: string[], image: string, heightUnits: string, widthUnits: string, id: string) {
        this.height = height;
        this.heightUnits = heightUnits;
        this.image = image;
        this.id = id;
        this.notes = notes;
        this.quantity = quantity;
        this.signType = signType;
        this.width = width;
        this.widthUnits = widthUnits;
    }
}