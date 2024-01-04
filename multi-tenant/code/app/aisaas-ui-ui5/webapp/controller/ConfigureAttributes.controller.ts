import BaseController, { CAP_ATTRIBUTE_URL } from "./BaseController";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import MessageToast from "sap/m/MessageToast";
import Table from "sap/m/Table";
import ColumnListItem from "sap/m/ColumnListItem";
import { AttributeExplanation } from "ui/model/entities";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import VBox from "sap/m/VBox";
import Text from "sap/m/Text";
import RangeSlider from "sap/m/RangeSlider";
import Event from "sap/ui/base/Event";
import RadioButtonGroup from "sap/m/RadioButtonGroup";
import HBox from "sap/m/HBox";
import JSONModel from "sap/ui/model/json/JSONModel";

export default class ConfigureAttribute extends BaseController {
    private valueToAddState: JSONModel;
    private addedValues: Array<AttributeExplanation> = [];

    public onInit(): void {
        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        this.onUpdateAttributeDetailsBinding()  
        this.valueToAddState = new JSONModel({values:[]});
        this.setModel(this.valueToAddState, "localModel");
    }


    private getColumnlist(): ColumnListItem {
        return this.byId("columnListitem") as ColumnListItem
    }
    private getTable(): Table {
        return this.byId("attributeTable") as Table
    }
  
    public onUpdateAttributeDetailsBinding(): void {
        const oTable = this.getTable()

        oTable.unbindItems();

        oTable.bindItems({
            path: "att>/Attributes", 
            template: this.getColumnlist(), 
            templateShareable: true
        });
    }
  
    public setBreadCrumblink(): void {
        const oTable = this.getTable()

        oTable.unbindItems();

        oTable.bindItems({
            path: "att>/Attributes", 
            template: this.getColumnlist(), 
            templateShareable: true
        });
    }

    public async openAddAttributeDialog(): Promise<void> {
        const dialog = this.byId("addAttributeDialog") as Dialog;
        const closeButton = new Button({ text: this.getText("buttons.close"), press: () => this.onClose(dialog) });
        dialog.setEndButton(closeButton);
        dialog.open();
    }

    private getRadioButtonGroup(){
        return this.byId("radioButtonGroup") as RadioButtonGroup
    }

    public async onClose(dialog: Dialog){
        this.getAttributeAndExplanationInput().attributeInput.setValue("")
        this.getAttributeAndExplanationInput().explanationInput.setValue("")
        
        this.getRadioButtonGroup().setSelectedIndex(-1);

        const inputBox = this.byId("inputValuesTemplate") as VBox;
        inputBox.removeAllItems()

        const valueTable = this.byId("valuesToAdd") as Table;
        valueTable.removeAllItems()

        this.setVisibilityValueElements(false, false)
        dialog.close()
    }
    
    private getAttributeAndExplanationInput(){
        const attributeInput = this.byId("attribute") as Input
        const explanationInput = this.byId("explanation") as Input
        return {attributeInput: attributeInput, explanationInput: explanationInput}
    }

    public async onAddAttributes(): Promise<void> {
        const dialog = this.byId("addAttributeDialog") as Dialog;
        const radioButtonGroup = this.getRadioButtonGroup()

        try {
            const model = this.getModel("att") as ODataModel;
            const httpHeaders = model.getHttpHeaders();

            const values = this.getRadioButtonText() === "Value Set" ? this.getModelValues()[0] : [];

            dialog.setBusy(true);
            this.onUpdateAttributeDetailsBinding()
            const response = await fetch(`${CAP_ATTRIBUTE_URL}/addAttributes`, {
                method: "POST",
                headers: {
                    // @ts-ignore
                    "X-CSRF-Token": httpHeaders["X-CSRF-Token"],
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    attribute: this.getAttributeAndExplanationInput().attributeInput.getValue(),
                    explanation: this.getAttributeAndExplanationInput().explanationInput.getValue(),
                    valueType: this.getRadioButtonText(),
                    values: values
                })
            });
            if (response.ok) {
                dialog.close();
                this.getModel("att").refresh();
            } else {
                MessageToast.show(this.getText("email.texts.genericErrorMessage"));
            }
        } catch (error) {
            console.log(error);
            MessageToast.show(this.getText("email.texts.genericErrorMessage"));
        } finally {
            dialog.setBusy(false);
            radioButtonGroup.setSelectedIndex(-1);
        }
    }
    public async onDeleteAttribute(): Promise<void> {
        const oTable = this.getTable()
        oTable.setMode("MultiSelect")

        const addButton = this.byId("addButton") as Button
        const cancelButton = this.byId("cancelButton") as Button

        if(oTable.getMode() === "MultiSelect"){
            addButton.setVisible(false)
            cancelButton.setVisible(true)
            const selectedItems = oTable.getSelectedItems() as ColumnListItem[];

            if(selectedItems.length > 0){
                try {
                    const oDataModel = this.getModel("att") as ODataModel;
                    const httpHeaders = oDataModel.getHttpHeaders();
                    
                    const ids: string[]= selectedItems.map((selectedItem: ColumnListItem) => {
                        return (selectedItem.getCells()[0] as Text).getText(true)
                    });
            
                    const response = await fetch(`${CAP_ATTRIBUTE_URL}/deleteAttribute`, {
                        method: "POST",
                        headers: {
                            // @ts-ignore
                            "X-CSRF-Token": httpHeaders["X-CSRF-Token"],
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                           ids: ids
                        })
                    });
                    if (response.ok) {
                        MessageToast.show(this.getText("Attribute has been deleted"));
                        this.getModel("att").refresh();
                        addButton.setVisible(true)
                    } else {
                        MessageToast.show(this.getText("email.texts.genericErrorMessage"));
                    }
                } catch (error) {
                    console.log(error);
                    MessageToast.show(this.getText("email.texts.genericErrorMessage"));
                }

            }
        }
    };

    public onCancelDeleteMode(){
        const cancelButton = this.byId("cancelButton") as Button
        const addButton = this.byId("addButton") as Button

        cancelButton.setVisible(false)
        addButton.setVisible(true)

        const oTable = this.getTable()
        oTable.setMode("None")
    }
    
    private getRadioButtonText(): string{
        return this.getRadioButtonGroup().getSelectedButton().getText() as string
    }

    public selectButton(): void {        
        const radioButtonText = this.getRadioButtonText()
        if (radioButtonText === "Value Set") {
            this.setVisibilityValueElements(true, false)
            this.onAddValue()
        }
        else{
            this.setVisibilityValueElements(true, false)
        }
    }

    private getInputValuesTemplateBox(){
        return this.byId("inputValuesTemplate") as VBox;
    }

    public onAddValue(){
        const valuesBox = this.getInputValuesTemplateBox()

        const valuesInput = new Input({ placeholder: "Value", width:"100%" });
        const explanationInput = new Input({ placeholder: "Explanation" , width:"100%"});
       
        const inputBox: HBox = new HBox({wrap: "Wrap",  width:"100%"})

        const valuesInputBox = this.addValueInput("Value", valuesInput)
        const explanationInputBox = this.addValueInput("Explanation", explanationInput)

        inputBox.addItem(valuesInputBox)
        inputBox.addItem(explanationInputBox)

        const saveValueButton: Button = new Button({
            text: "Save Value",
            type: "Emphasized",
            press: () => {
                this.onSaveValue(
                    valuesInput.getValue(),explanationInput.getValue(),valuesBox);
            }
        })
        saveValueButton.addStyleClass("sapUiMediumMarginTop")
        valuesBox.addItem(inputBox)
        valuesBox.addItem(saveValueButton)
    }

    private setVisibilityValueElements(addAttributesButtonEnablement: boolean, addedValuesVisibility: boolean ){
        const addedValues = this.byId("addedValues") as VBox
        const addAttributesButton = this.byId("addAttributeButton") as Button;

        addAttributesButton.setEnabled(addAttributesButtonEnablement)
        addedValues.setVisible(addedValuesVisibility)
    }


    private addValueInput(labelText: string, input:Input | RangeSlider): VBox{
        const valuesInputBox: VBox = new VBox({wrap: "Wrap"});
        valuesInputBox.setWidth(labelText == "Value" ? "30%" : "70%");

        const label = new Text({ text: labelText});
        valuesInputBox.addItem(label);
        valuesInputBox.addItem(input);
        label.addStyleClass("sapUiMediumMarginTop sapUiMTinymMarginEnd");
        return valuesInputBox
    }

    public onCancelValue(): void {
        this.setVisibilityValueElements(true, false)
    }

    public setAttributeEnabled(event: Event): void {
        const explanationInput: number = (event.getSource() as Input).getValue().length;
        const addAttributeButton = this.byId("addAttributeButton") as Button
        const enablement =  explanationInput > 0

        addAttributeButton.setEnabled(enablement)
    }

    public async onSaveValue(value: string, valueExplanation: string, valuesBox:VBox): Promise<void>{
        this.setVisibilityValueElements(true, true)
        
        const valueTable: Table = this.byId("valuesToAdd") as Table
        const oRow = new ColumnListItem({
            cells: [
                new Text({ text: value }),
                new Text({ text: valueExplanation })
            ]
        });

        valueTable.addItem(oRow);

        const inputBox = this.getInputValuesTemplateBox();

        valuesBox.setVisible(true)
        inputBox.removeAllItems()

        const existingValues = this.getModelValues()
        existingValues.push(this.appendValues(value, valueExplanation));
        this.onAddValue()
    }

    private getModelValues(){
        const model = this.getModel("localModel")
        return model.getProperty("/values") || [];
    }

    public appendValues(value: string, valueExplanation: string){
        this.addedValues.push({value: value, valueExplanation: valueExplanation})
        return this.addedValues
    }
    
    public onPressNavigate(): void {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("main");
    }
    
}