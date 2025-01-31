const { Composer, Markup,Extra } = require("telegraf");
const composer = new Composer();

const { Sequelize,DataTypes } = require('sequelize');
const {Person,Purchase,Service, Appointment} =require("../connection/model/people");

const ENGINEER = parseInt(process.env.ENGINEER_ID, 10); // Преобразуем строку в число

// Удаление последней строки из таблицы Service командой /delete
composer.command("deletePurshare", async (ctx) => {
    const id = ctx.from.id;
    if (id === ENGINEER) {
        const user = await Person.findOne({where:{telegramId: id}})
        const lastPurshare = await Purchase.findOne({where: { personId: user.id, status: "pending" }});

        if (!lastPurshare) {
          console.log("Непотвержденных записей не найдено");
          ctx.reply("Непотвержденных записей не найдено");
          return;
        }

        const service = await Service.findOne({where:{id: lastPurshare.serviceId}})
        const appointment = await Appointment.findOne({where: { id: last.appointmentId }});

        if (lastPurshare) {
          await Purchase.destroy({ where: {id: lastPurshare.id, },});
          console.log(`Последняя запись пользователя ${service.name} с ID=${lastPurshare.id} удалена.`);
          ctx.replyWithHTML(`Последняя запись <b>${service.name}</b> пользователя  с <b>ID: ${lastPurshare.id}</b> удалена.`);
          if(service.id !== 1){
              // Найти обе записи по id
              const appointments = await Appointment.findAll({where: {id: {[Sequelize.Op.in]: [appointment.id, appointment.id+1 ]},
                    status: "booked"
              }
            });
  //Удаляем записи
            await Promise.all(appointments.map(b => {
              console.log(`время: ${b.time} удалено`);
              b.destroy()
            }
            ));
          }else{
            await Appointment.destroy({ where: {id: appointment.id, },});
            console.log(`БЕСПЛАТНАЯ КОНСУЛЬАТАЦИЯ УДАЛЕНА`);
          }
}
    } else {
      ctx.reply("Команда доступна только администратору.");
    }
})
  


module.exports = composer;  