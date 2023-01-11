interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

interface Grocery {
    id: string;
    item_id: Pick<Item, 'id'>;
    updated_at: Date;
    amount: number;
    isChecked: boolean | number;
}

interface Item {
    id: string;
    name: string;
    user_id?: Pick<User, 'id'>;
}

interface Unit {
    id: string;
    name: string;
}

interface Recipe {
    id: string;
    title: string;
    user_id: Pick<User, 'id'>;
}

interface Category {
    id: string;
    name: string;
}

interface Plan {
    id: string;
    updated_at: Date;
    date: Date;
    type: string;
    recipe: Omit<Recipe, 'user_id'>[];
}