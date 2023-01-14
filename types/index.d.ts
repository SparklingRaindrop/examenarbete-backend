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
    user_id: User['id'];
}

interface Item {
    id: string;
    name: string;
    unit_id: Unit['id'];
    user_id?: User['id'];
}

interface Unit {
    id: string;
    name: string;
    user_id: User['id'];
}

interface Recipe {
    id: string;
    title: string;
    user_id?: User['id'];
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

interface Ingredient {
    item_id: Item['id'];
    name: Item['name'];
    unit: Unit['name'];
    amount: number;
}

interface Stock {
    id: string;
    item_id: Item['id'];
    amount: number;
    user_id: User['id'];
}