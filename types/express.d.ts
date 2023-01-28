declare namespace Express {
    export interface Request {
        user: Pick<User, 'id'>
    }
}