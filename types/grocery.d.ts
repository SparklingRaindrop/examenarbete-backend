export interface GroceryItem {
    item_id: string;
    updated_at: Date;
    amount: number;
};

export type Grocery = GroceryItem[];

