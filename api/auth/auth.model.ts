import knex from '../../knex/knex';

type LoginOption = 'username' | 'email';
export async function getUser(userData: { [key in LoginOption as string]: string }): Promise<User | undefined> {
    try {
        return await knex<User>('User')
            .select()
            .where(userData)
            .first();
    } catch (error) {
        console.error(error);
    }
    return;
}