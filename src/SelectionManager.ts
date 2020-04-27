import { ISelectionFeature } from "./ISelectionFeature";

export class SelectionManager {
    selectedTiles: Set<string>;

    uiContentElement: HTMLElement;

    uiStatusElement: HTMLElement;

    constructor(uiContentElement: HTMLElement, uiStatusElement: HTMLElement) {
        this.selectedTiles = new Set();
        this.uiContentElement = uiContentElement;
        this.uiStatusElement = uiStatusElement;
        this.clearSelection();
    }

    addToSelection(url: string) {
        console.log(url);
        console.log(this.selectedTiles.size);
        this.selectedTiles.add(url);
        this.buildText();
    }

    removeFromSelection(url: string) {
        this.selectedTiles.delete(url);
        this.buildText();
    }

    isSelected(url: string) {
        return this.selectedTiles.has(url);
    }

    clearSelection() {
        this.selectedTiles.clear();
        this.buildText();
    }

    buildText() {
        this.uiContentElement.innerHTML = "";
        if (this.selectedTiles.size > 0) {
            this.uiContentElement.innerHTML = "wget ";
            this.selectedTiles.forEach(tile => {
                this.uiContentElement.innerHTML += `${tile} `;
            });
        }
        this.uiStatusElement.innerHTML = `${this.selectedTiles.size} Selected`;
    }
}