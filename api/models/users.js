'use strict';
    const Sequelize = require('sequelize');
    var bcrypt = require('bcryptjs');
   

    module.exports = (sequelize, DataTypes) => {
      class User extends Sequelize.Model {}
      User.init(
        {
          id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
          },
          firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: "First name is required",
              },
              notEmpty: {
                msg: "Please provide a name",
              },
            },
          },
          lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: "Last name is required",
              },
            },
          },
          emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
              msg: "The email you entered already exists",
            },
            validate: {
              notNull: {
                msg: "An email is required",
              },
              isEmail: {
                msg: "Pleases provide a valid email address",
              },
            },
          },
          password: {
            type: DataTypes.STRING,
            allowNull: false,
            set(val) {
              if (val) {
                const hashedPassword = bcrypt.hashSync(val, 10);
                this.setDataValue("password", hashedPassword);
              }
            },
            validate: {
              notNull: {
                msg: "A password is required",
              },
              notEmpty: {
                msg: "Please provide a password",
              },
            },
          },
        },
        { sequelize }
      );

      User.associate = (models) => {
        User.hasMany(models.Course, {
          foreignKey: {
            fieldName: "userId",
            allowNull: false,
          },
        });
      };

      return User;
    };