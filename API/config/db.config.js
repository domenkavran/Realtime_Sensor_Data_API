module.exports = {
    DB: {
      HOST: "127.0.0.1",
      PORT: 3306,
      USER: "user",
      PASSWORD: "password",
      DATABASE: "sensors",
      DIALECT: "mysql",
      DIALECT_OPTIONS: {
        connectTimeout: 60000
      },
      POOL: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }  
    },
    listPerPage: 10,
};