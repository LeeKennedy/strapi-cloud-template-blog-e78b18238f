'use strict';

module.exports = ({ env }) => ({
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        task: {
          field: 'slug',
          references: 'title',
        },
        technique: {
          field: 'slug',
          references: 'title',
        },
      },
    },
  },
});
