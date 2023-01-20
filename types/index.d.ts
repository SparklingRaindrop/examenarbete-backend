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

interface Instruction {
    id: string;
    recipe_id: Recipe['id'];
    step_no: number;
    instruction: string;
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
    recipe_id?: Recipe['id'];
}

interface Plan {
    id: string;
    updated_at: Date;
    date: number;
    type: string;
    recipe_id: Recipe['id'];
}

interface Ingredient {
    id: string;
    amount: number;
    item_id: Item['id'];
    recipe_id: Recipe['id'];
}

interface Stock {
    id: string;
    item_id: Item['id'];
    amount: number;
    user_id: User['id'];
}

interface KnexError extends Error {
    code?: number;
}