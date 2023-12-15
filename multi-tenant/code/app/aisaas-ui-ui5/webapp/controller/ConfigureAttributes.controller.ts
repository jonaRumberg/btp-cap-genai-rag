import BaseController, { CAP_ATTRIBUTE_URL } from "./BaseController";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import MessageToast from "sap/m/MessageToast";
import Table from "sap/m/Table";
import ColumnListItem from "sap/m/ColumnListItem";
import { AdditionalAttributes, AttributeExplanation } from "ui/model/entities";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import VBox from "sap/m/VBox";
import Text from "sap/m/Text";
import RangeSlider from "sap/m/RangeSlider";
import List from "sap/m/List";
import StandardListItem from "sap/m/StandardListItem";
import ListItemBase from "sap/m/ListItemBase";
import Event from "sap/ui/base/Event";
import RadioButtonGroup from "sap/m/RadioButtonGroup";


export default class ConfigureAttribute extends BaseController {
    protected readonly ATTRIBUTES_ENTITY_PATH: string = "api>/getAttributes";

    public onInit(): void {
        const oTable = this.byId("attributeTable") as Table
        const columnListItem = this.byId("columnListitem") 
        this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        
        oTable.bindItems({
            path: "att>/Attributes",
            template: columnListItem,
            templateShareable: true,
            key: "id"
        });
    }

    public async openAddAttributeDialog(): Promise<void> {
        const dialog = this.byId("addAttributeDialog") as Dialog;
        const closeButton = new Button({ text: this.getText("buttons.close"), press: () => this.onClose(dialog) });
        dialog.setEndButton(closeButton);
        dialog.open();
    }

    public async onClose(dialog: Dialog){
        const attributeInput = this.byId("attribute") as Input
        const explanationInput = this.byId("explanation") as Input
        attributeInput.setValue("")
        explanationInput.setValue("")

        const radioButtonGroup = this.byId("radioButtonGroup") as RadioButtonGroup
        radioButtonGroup.setVisible(false)

        const valuesBox = this.byId("addedValues") as VBox
        valuesBox.removeAllItems()

        dialog.close()
    }

    private configureButtonVisibility(buttonsVisibility: Record<string, boolean>): void {
        for (const [id, visibility] of Object.entries(buttonsVisibility)) {
            this.getButton(id).setVisible(visibility);
        }
    }
    private getButton(id: string): Button {
        return this.byId(id) as Button;
    }

    public onEdit():void  {
        this.configureButtonVisibility({
            editButton: false,
            addButton: false,
            cancelButton: true,
            deleteButton: true,
            saveButton: false
        });

        const oTable = this.byId("attributeTable") as Table;
        oTable.setMode("MultiSelect")

        const oEditableTemplate = new ColumnListItem({
            cells: [
                new Input({
                    value: "{att>ID}",
                    editable: false,
                    change(oEvent) {
                        oEvent.getParameter("value")
                    },
                }),
                new Input({
                    value: "{att>attribute}"
                }), new Input({
                    value: "{att>explanation}",
                    change(oEvent) {
                        oEvent.getParameter("value")
                    },
                })
            ]
        });
        const model = oTable.getBinding("{att>/Attributes}")
        this.rebindTable(oEditableTemplate,"Edit");
    }
  
    public onSelectionChange(): void {
        const editButton = this.getButton("editButton");
        const addButton = this.getButton("addButton");
        const saveButton = this.getButton("saveButton");
        const cancelButton = this.getButton("cancelButton");
        const deleteButton = this.getButton("deleteButton");
        const oTable = this.byId("attributeTable") as Table;
    
        const cancelDeleteSaveVisibility = !cancelButton.getVisible() && !deleteButton.getVisible() && !saveButton.getVisible();
        const addEditVisibility = !addButton.getVisible() && !editButton.getVisible();
        const hasSelectedItems = oTable.getSelectedItems().length > 0;
        this.configureButtonVisibility( 
            {editButton:addEditVisibility,
            addButton: addEditVisibility,
            cancelButton: cancelDeleteSaveVisibility,
            deleteButton: cancelDeleteSaveVisibility,
            saveButton: addEditVisibility && hasSelectedItems})
    }
    
    public onCancel(): void{
        this.configureButtonVisibility({
            editButton: false,
            addButton: false,
            cancelButton: true,
            deleteButton: true,
            saveButton: true
        });

        const columnListItem = this.byId("columnListitem") 
        this.rebindTable(columnListItem,"Navigation");
        const oTable = this.byId("attributeTable") as Table;
        oTable.setMode("None")
    }

    public rebindTable(template:any , sKeyboardMode: string) {
        const oTable = this.byId("attributeTable") as Table

        oTable.bindItems({
            path: "att>/Attributes",
            template: template,
            templateShareable: true,
            key: "ID"
        });
    }

    public async onAddAttributes(): Promise<void> {
        const dialog = this.byId("addAttributeDialog") as Dialog;

        try {
            const model = this.getModel("att") as ODataModel;
            const httpHeaders = model.getHttpHeaders();

            const attributeInput = this.byId("attribute") as Input
            const explanationInput = this.byId("explanation") as Input

            const list: List = this.byId("valuesToAddList") as List
            const items = list.getItems() 

            const values: AttributeExplanation[]= items.map((item:ListItemBase)=>{
                if (item instanceof StandardListItem) {
                    const attribute = item.getTitle(); 
                    const explanation = item.getDescription(); 
                    return { attribute, explanation };
                }
            })

            dialog.setBusy(true);
    
            const response = await fetch(`${CAP_ATTRIBUTE_URL}/addAttributes`, {
                method: "POST",
                headers: {
                    // @ts-ignore
                    "X-CSRF-Token": httpHeaders["X-CSRF-Token"],
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    attribute: attributeInput.getValue(),
                    explanation: explanationInput.getValue(),
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
        }
    }
    public async onSave(): Promise<void> {
        const visibilityOptions = {
            editButton: true,
            addButton: true,
            cancelButton: false,
            deleteButton: false,
            saveButton: false
        };
        this.configureButtonVisibility(visibilityOptions);
    
        const oTable = this.byId("attributeTable") as Table;
    
        try {
            oTable.setBusy(true);
    
            const model = this.getModel("att") as ODataModel;
            const httpHeaders = model.getHttpHeaders();
            const selectedItems = oTable.getSelectedItems() as ColumnListItem[];
    
            const promises = selectedItems.map(async (selectedItem: ColumnListItem) => {
                const cell = selectedItem.getCells() as Input[];
                const changedEntry: AdditionalAttributes = {
                    attribute: {attribute:cell[1].getValue(), explanation: cell[2].getValue()},
                };
                const id = cell[0].getValue();
                return { id, changedEntry };
            });
    
            const changedElements = await Promise.all(promises);
            console.log(changedElements);
    
            const response = await fetch(`${CAP_ATTRIBUTE_URL}/editAttributes`, {
                method: "POST",
                headers: {
                    // @ts-ignore
                    "X-CSRF-Token": httpHeaders["X-CSRF-Token"],
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ids: changedElements.map((entry: any) => entry.id),
                    attributes: changedElements.map((entry: any) => entry.changedEntry)
                })
            });
    
            if (response.ok) {
                this.getModel("att").refresh();
            } else {
                MessageToast.show(this.getText("email.texts.genericErrorMessage"));
            }
        } catch (error) {
            console.log(error);
            MessageToast.show(this.getText("email.texts.genericErrorMessage"));
        } finally {
            oTable.setBusy(false);
        }
    }

    public async onDeleteMode(): Promise<void> {
        const visibilityOptions = {
            editButton: true,
            addButton: true,
            cancelButton: true,
            deleteButton: true,
            saveButton: false
        };
        this.configureButtonVisibility(visibilityOptions);
    
        const oTable = this.byId("attributeTable") as Table;
    
        try {
            const oDataModel = this.getModel("att") as ODataModel;
            const httpHeaders = oDataModel.getHttpHeaders();
            const selectedItems = oTable.getSelectedItems() as ColumnListItem[];
            const ids: string[] = selectedItems.map((selectedItem: ColumnListItem) => {
                const cell = selectedItem.getCells()[0] as Input;
                return cell.getValue();
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
            } else {
                MessageToast.show(this.getText("email.texts.genericErrorMessage"));
            }
        } catch (error) {
            console.log(error);
            MessageToast.show(this.getText("email.texts.genericErrorMessage"));
        }
    };
    public setEnablementAddValueButton(event: Event) {
        const attribute: string = (event.getSource() as Input).getValue();
        const explanation = this.byId("explanation") as Input
        const validate: boolean = attribute.trim().length > 0 && explanation.getValue().trim().length > 0;

        const addValueButton = this.byId("addValueButton") as Button
        addValueButton.setEnabled(validate);
    }

    public onSelectButton(): void {
        const valuesBox = this.byId("inputValuesTemplate") as VBox;

        const valuesInput = new Input({ placeholder: "value" });
        const explanationInput = new Input({ placeholder: "Explanation" });
        const rangeSliderInput = new RangeSlider({
            min: 1,
            max: 10,
            range: [1, 10], 
            width: "100%",
            inputsAsTooltips: true
        });

        const text: string = this.getSelectedItem()

        if (text === "Text Value") {
            this.addValueInput("Value", valuesInput)
            this.addValueInput("Explanation", explanationInput)
        } else if (text === "Combined Value") {
            this.addValueInput("Value", valuesInput)
            this.addValueInput("Explanation", explanationInput)
            this.addValueInput("Range", rangeSliderInput)
        }
        else if(text=== "Range Value"){
            this.addValueInput("Range", rangeSliderInput)
        }

        const mergedExplanation = (explanation?: string, range?: number[]): string => {
            const rangeText = range ? `The range is between ${range[0]} and ${range[1]}` : '';
            return explanation ? explanation + ' ' + rangeText : rangeText.trim();
        };
    
        const defineAttribute = (attribute?: string): string => attribute || "Range";
    
        const saveValueButton: Button = new Button({
            text: "Save Value",
            press: () => {
                const attribute = defineAttribute(valuesInput.getValue());
                const explanation = mergedExplanation(explanationInput.getValue(), rangeSliderInput.getRange());
                this.onSaveValue(attribute, explanation);
            }
        });
        valuesBox.addItem(saveValueButton);
    }
    
    public getSelectedItem(): string{
        const radioButton: RadioButtonGroup = this.byId("radioButtonGroup") as RadioButtonGroup
        return radioButton.getSelectedButton().getText();
    }
    public addValueInput(labelText: string, input:Input | RangeSlider){
        const valuesBox = this.byId("inputValuesTemplate") as VBox;
        const label = new Text({ text: labelText});
        valuesBox.addItem(label);
        valuesBox.addItem(input);
        label.addStyleClass("sapUiMediumMarginTop sapUiMTinymMarginEnd");
    }

    public setVisibilityValueElements(addValueBoxVisibility: boolean, addAttributesButtonVisibility: boolean){
        const addValueBox = this.byId("selectValueType") as VBox
        addValueBox.setVisible(addValueBoxVisibility)
        
        const addAttributesButton = this.byId("addAttributeButton") as Button;
        addAttributesButton.setEnabled(addAttributesButtonVisibility)
    }

    public onCancelValue(): void {
        this.setVisibilityValueElements(false, false)
    }

    public onAddValue(): void {
        this.setVisibilityValueElements(true, true)
    }

    public async onSaveValue(attribute: string, explanation:string): Promise<void>{
        const list: List = this.byId("valuesToAddList") as List
        const radioButtonGroup = this.byId("radioButtonGroup") as RadioButtonGroup
        const inputBox = this.byId("inputValuesTemplate") as VBox;
        const valuesBox = this.byId("addedValues") as VBox;

        const newListItem: StandardListItem = new StandardListItem({
            title: attribute,
            description: explanation
        });

        list.addItem(newListItem)

        valuesBox.setVisible(true)
        radioButtonGroup.setSelectedIndex(-1);
        this.setVisibilityValueElements(false, true)
        inputBox.removeAllItems()
    }
    
    public onPressNavigate(): void {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("main");
    }

    public formatValues (values: Array<AttributeExplanation>) {

        if (Array.isArray(values)) {
            return values.map(value => value.attribute).join(', ');
        }
        return ""; 
    }
}