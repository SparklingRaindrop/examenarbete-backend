import knex from '../../knex/knex';

type LoginOption = 'username' | 'email';
export function getUser(userData: { [key in LoginOption as string]: string }): Promise<User | undefined> {
    return knex<User>('User')
        .select()
        .where(userData)
        .first();
}

export async function addUser(newData: User): Promise<Omit<User, 'id' | 'password'>> {
    return knex<User>('User')
        .insert({ ...newData })
        .then(() => {
            const result = newData as Omit<User, 'id' | 'password'> & {
                password?: string,
                id?: string;
            };
            delete result.password;
            delete result.id;
            return result;
        });
}

export async function isAvailableEmail(email: User['email']): Promise<boolean> {
    return knex<User>('User')
        .select()
        .where('email', email)
        .first()
        .then((result) => typeof result === 'undefined');
}