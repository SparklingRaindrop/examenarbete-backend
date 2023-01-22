interface User {
    id: string;
    username: string;
    email: string;
    password: string;
}

interface Unit {
    id: string;
    name: string;
    user_id: User['id'];
}

interface Item {
    id: string;
    name: string;
    unit_id: Unit['id'];
    user_id?: User['id'];
}

interface ItemResponse extends Pick<Item, 'id' | 'name'> {
    unit: Omit<Unit, 'user_id'>
}

interface Grocery {
    id: string;
    item_id: Item['id'];
    updated_at: Date;
    amount: number;
    isChecked: boolean | number;
    user_id: User['id'];
}

interface GroceryResponse extends Omit<Grocery, 'user_id' | 'item_id'> {
    item: ItemResponse,
}

interface Plan {
    id: string;
    updated_at: Date;
    date: number;
    type: string;
    recipe_id: Recipe['id'];
}

interface PlanResponse extends Omit<Plan, 'recipe_id'> {
    recipe: RecipeResponse;
}

interface Ingredient {
    id: string;
    amount: number;
    item_id: Item['id'];
    recipe_id: Recipe['id'];
}

interface IngredientResponse extends Pick<Ingredient, 'id' | 'amount'> {
    item: ItemResponse,
    amount: Ingredient['amount'];
}

interface InstructionResponse {
    id: string;
    step_no: number;
    instruction: string;
}
interface Instruction extends InstructionResponse {
    recipe_id: Recipe['id'];
    user_id?: User['id'];
}

interface Recipe {
    id: string;
    title: string;
    user_id?: User['id'];
}

interface RecipeResponse extends Omit<Recipe, 'user_id'> {
    ingredients: IngredientResponse[];
    instructions: InstructionResponse[];
}

interface Stock {
    id: string;
    item_id: Item['id'];
    amount: number;
    user_id: User['id'];
}

interface StockResponse extends Pick<Stock, 'id' | 'amount'> {
    item: Pick<Item, 'id' | 'name'>
    unit: Pick<Unit, 'id' | 'name'>
}
interface KnexError extends Error {
    code?: number;
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