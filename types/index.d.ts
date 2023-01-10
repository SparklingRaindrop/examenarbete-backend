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
