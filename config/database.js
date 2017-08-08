const _dbhost = process.env.DB_HOST
const _dbport = process.env.DB_PORT
const _dbname = process.env.DB_NAME
const _dbuser = process.env.DB_USER
const _dbpass = process.env.DB_PASS

module.exports = {
    mongodb: `mongodb://${_dbuser}:${_dbpass}@${_dbhost}:${_dbport}/${_dbname}`
}