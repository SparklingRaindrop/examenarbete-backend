export const enum Status {
    Succuss = 200,
    Created = 201,
    NoContent = 204,
    BadRequest = 400,
    Forbidden = 403,
    NotFound = 404,
}

export const enum Error {
    MissingData = 'Required data is missing.',
    AlreadyExist = 'The requested item already exists.',
    Unsuccessful = 'Something happened on server',
}