declare namespace Express {
    export interface Request {
        user: {
            id: Pick<User, 'id'>
        }
    }
}