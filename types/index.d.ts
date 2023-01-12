interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

interface Grocery {
    id: string;
    item_id: Item['id'];
    updated_at: Date;
    amount: number;
    isChecked: boolean | number;
}

interface Item {
    id: string;
    name: string;
    user_id?: User['id'];
}

interface Unit {
    id: string;
    name: string;
}

interface Recipe {
    id: string;
    title: string;
    user_id: User['id'];
}

interface Category {
    id: string;
    name: string;
}

interface CategoryList {
    name: Category['name'],
    id: Category['id'],
    recipe_id?: Recipe['name'];
}

interface Plan {
    id: string;
    updated_at: Date;
    date: Date;
    type: string;
    recipe_id: Recipe['id'];
}