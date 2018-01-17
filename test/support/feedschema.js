const feedSchema = {
  title: 'feed schema',
  type: 'object',
  required: ['provider', 'posts'],
  properties: {
    provider: {
      type: 'object',
      required: ['name', 'url'],
      properties: {
        name: {
          type: 'string',
          minLength: 1,
        },
        url: {
          type: 'string',
          minLength: 1,
          format: 'uri',
        },
      },
    },
    posts: {
      type: 'array',
      items: {
        type: 'object',
        required: ['title', 'url'],
        properties: {
          title: {
            type: 'string',
            minLength: 1,
          },
          url: {
            type: 'string',
            minLength: 1,
            format: 'uri',
          },
          thumbnailUrl: {
            type: 'string',
            minLength: 1,
            format: 'uri',
          },
        },
      },
      minItems: 1,
    },
  },
};

module.exports = feedSchema;
