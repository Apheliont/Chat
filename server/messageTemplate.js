module.exports.generateMessage = function ({name = '', group = '', message = 'No message', messageSource = 0} = {}) {
  const currentDate = new Date();
  const currentDateString = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
  return {name, group, message, date: currentDateString, messageSource};
};
