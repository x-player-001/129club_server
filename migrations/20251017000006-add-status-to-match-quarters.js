'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('match_quarters', 'status', {
      type: Sequelize.ENUM('in_progress', 'completed'),
      allowNull: false,
      defaultValue: 'in_progress',
      comment: '节次状态：in_progress=进行中, completed=已完成',
      after: 'summary'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('match_quarters', 'status');
  }
};
