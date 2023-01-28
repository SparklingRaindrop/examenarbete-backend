enum Error {
    MissingData = 'Required data is missing.',
    AlreadyExist = 'The requested item already exists.',
    SomethingHappened = 'Something happened on server',
    InvalidDataType = 'Received invalid type of data.',
}

export default Error;