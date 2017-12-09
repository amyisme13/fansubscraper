const dbhost = process.env.DB_HOST;
const dbport = process.env.DB_PORT;
const dbname = process.env.DB_NAME;
const dbuser = process.env.DB_USER;
const dbpass = process.env.DB_PASS;

module.exports = {
    mongodb: `mongodb://${dbuser}:${dbpass}@${dbhost}:${dbport}/${dbname}`,
};
