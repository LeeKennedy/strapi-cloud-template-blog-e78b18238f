'use strict';
const bootstrap = require("./bootstrap");

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = {
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {

      // Populate slug field if empty
      if (context.action === 'create') {
        const schema = strapi.contentType(context.uid);
        const data = context.params?.data;
        if (schema?.attributes?.slug && data && !data.slug && data.title) {
          data.slug = toSlug(data.title);
        }
      }
      return next();
    });
  },

  bootstrap,
};