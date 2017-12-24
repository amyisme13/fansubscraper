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
        },
        url: {
          type: 'string',
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
          },
          url: {
            type: 'string',
            format: 'uri',
          },
          thumbnailUrl: {
            type: 'string',
            format: 'uri',
          },
        },
      },
      minItems: 1,
    },
  },
};

module.exports = feedSchema;
