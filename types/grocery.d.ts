export interface GroceryItem {
    item_id: string;
    updated_at: Date;
    amount: number;
    isChecked: boolean | number;
}

export type Grocery = GroceryItem[];

