require("dotenv").config();
const { Sequelize,DataTypes } = require('sequelize');
const db = require("../db.connection")
const Op = Sequelize.Op;

const Person = db.define("Person", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  userName: { type: DataTypes.STRING },
  telegramId: { type: DataTypes.BIGINT, allowNull: false },
  phone: { type: DataTypes.STRING },
  visit: { type: DataTypes.INTEGER, defaultValue: 0 },
  guestName: { type: DataTypes.STRING }, // Новое поле для гостевых имен
});

const Message = db.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nameMessage: { type: DataTypes.TEXT },
  messageId: { type: DataTypes.INTEGER, allowNull: false },
});


const Appointment = db.define("Appointment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  personId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: true },
  time: { type: DataTypes.TIME, allowNull: true },
  status: {
    type: DataTypes.ENUM,
    values: ['free', 'booked'],
    allowNull: false,
    defaultValue: 'free',
  },
});

const Service = db.define("Service", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  imageURL: { type: DataTypes.STRING,},
});

const Purchase = db.define("Purchase", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  personId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  appointmentId: { type: DataTypes.INTEGER, allowNull: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  time: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.ENUM,
    values: ['pending', 'confirmed', 'cancelled'],
    allowNull: false,
    defaultValue: 'pending',
  },
  totalPrice: { type: DataTypes.INTEGER, allowNull: false },
  messageId: { type: DataTypes.STRING },
  messageId2: { type: DataTypes.STRING },
});

// Определение связей между моделями
Person.hasMany(Appointment, { foreignKey: 'personId' });
Appointment.belongsTo(Person, { foreignKey: 'personId' });

Person.hasMany(Message, { foreignKey: 'personId' });
Message.belongsTo(Person, { foreignKey: 'personId' });

Service.hasMany(Appointment, { foreignKey: 'serviceId' }); // Новая связь
Appointment.belongsTo(Service, { foreignKey: 'serviceId' }); // Новая связь


Person.hasMany(Purchase, { foreignKey: 'personId' });
Purchase.belongsTo(Person, { foreignKey: 'personId' });

Service.hasMany(Purchase, { foreignKey: 'serviceId' });
Purchase.belongsTo(Service, { foreignKey: 'serviceId' });

Purchase.belongsTo(Appointment, { foreignKey: 'appointmentId', onDelete: 'SET NULL' });
Appointment.hasMany(Purchase, { foreignKey: 'appointmentId' });

module.exports = {
  Person,
  Message,
  Appointment,
  Service,
  Purchase,
  
};